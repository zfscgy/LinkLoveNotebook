from sqlalchemy import Column, Integer, BigInteger, String, DateTime, Text, \
    PrimaryKeyConstraint, ForeignKey, Index, Table, \
    create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.sql import and_, or_, functions as f

from Configs import *


base = declarative_base()

# 用户 - 笔记本收藏关系
UserNotebookCollection = Table(
    "user_notebook_collection",
    base.metadata,
    Column("uid", Integer, ForeignKey('user.uid')),
    Column("nid", Integer, ForeignKey('notebook.nid'))
)


class User(base):
    __tablename__ = "user"
    # 用户序号
    uid = Column(Integer, primary_key=True, autoincrement=True)
    # 用户id，最大长度16，数字，字母，下划线组成。首个字符必须是字母
    rid = Column(String(16), index=True)
    # 用户注册时间
    reg_time = Column(DateTime)
    # md5(用户序号+用户id+用户私钥)
    u_key_md5 = Column(String(32))
    # 用户昵称，长度<32
    name = Column(String(32))
    # 用户头像地址
    avatar = Column(String(32))
    # 用户的个性签名
    desc = Column(String(128))
    # 用户状态, 0
    status = Column(Integer)

    # 用户收藏关系，是 用户-笔记本的 Many to Many 关系
    # backref表示在 Notebook 上可以用 Notebook.collectors 访问
    collection = relationship("Notebook", secondary=UserNotebookCollection, backref="collectors")


class Friends(base):
    __tablename__ = "friends"
    # 好友关系编号
    fid = Column(Integer, primary_key=True, autoincrement=True)
    # 用户1 rid
    uid1 = Column(Integer)
    # 用户2 rid
    uid2 = Column(Integer)
    # 状态
    # 0 表示 用户1与用户2结为好友关系
    # 1 表示 用户1正在向用户2提出好友申请,,
    # 2 表示 用户2正在向用户1提出好友申请
    # 3 表示 用户2拒绝了用户1的好友申请
    # 4 表示 用户1拒绝了用户2的好友申请
    status = Column(Integer)
    status_time = Column(DateTime)


Index("ix_f_id1", Friends.uid1)
Index("ix_f_id2", Friends.uid2)


class Notebook(base):
    __tablename__ = "notebook"
    # 笔记本编号
    nid = Column(Integer, primary_key=True, autoincrement=True)
    # 笔记本id（最大长度16）
    rid = Column(String(16), index=True)
    # 笔记本名称（最大长度32）
    name = Column(String(32))
    # 笔记本创建者
    creator = Column(Integer , ForeignKey(User.uid))
    # 笔记本创建时间
    create_time = Column(DateTime)
    # 笔记本描述（最大128字符）
    desc = Column(String(128))
    # 笔记本权限
    # 0 表示 仅作者， 1 表示多人有写权限， 2 表示公开（任何人有写权限）， 4表示 多人权限仍在审核中
    mode = Column(Integer)
    author = relationship(User, backref="notebooks")
    # 内容长度，初始为0
    content_length = Column(Integer)


class UserNotebookMode(base):
    __tablename__ = "user_notebook_mode"
    uid = Column(Integer, ForeignKey(User.uid))
    nid = Column(Integer, ForeignKey(Notebook.nid))
    # 0 表示 正在接受写权限， 1 表示已经拥有写权限, 2 表示任何人都有写权限, 3 表示拒绝写权限
    write_auth = Column(Integer)
    # 0 表示不显示在主页上， 1 表示显示在主页上
    show_mode = Column(Integer)
    PrimaryKeyConstraint(uid, nid)
    user = relationship(User, backref="preferred_notebooks")
    notebook = relationship(Notebook, backref="preferred_writers")

class NotebookContent(base):
    __tablename__ = "notebook_content"
    cid = Column(BigInteger, primary_key=True, autoincrement=True)
    # 作者id
    uid = Column(Integer, ForeignKey(User.uid),  index=True)
    # 笔记本id
    nid = Column(Integer, ForeignKey(Notebook.nid), index=True)
    # 楼层号
    floor = Column(Integer)
    # 回复楼层
    ref = Column(Integer)
    # 发布时间
    time = Column(DateTime)
    content = Column(Text)
    imgs = Column(String(320))
    notebook = relationship(Notebook, backref="contents")
    author = relationship(User, backref="contents")


class VoteHistory(base):
    __tablename__ = "vote_history"
    vid = Column(BigInteger, primary_key=True, autoincrement=True)
    nid = Column(Integer, ForeignKey(Notebook.nid), index=True)
    cid = Column(BigInteger, ForeignKey(NotebookContent.cid))
    uid = Column(Integer, ForeignKey(User.uid))
    time = Column(DateTime)
    # 0: upvote 1:downvote, 2:reward
    vote_type = Column(Integer)
    # The amount of reward, default 0
    amount = Column(BigInteger)


Index("ix_vh_u_c", VoteHistory.uid, VoteHistory.cid)

engine = create_engine("mysql+pymysql://root:zhengfei@127.0.0.1/note01?charset=utf8",
                       encoding=encoding)
Session = sessionmaker()
Session.configure(bind=engine)
base.metadata.bind = engine
base.metadata.create_all()


def dbmsg(msg='ok', data=None):
    return {'dbmsg': msg, 'data': data}


import datetime


def login(rid: str, key_md5: str):
    session = Session()
    user = session.query(User).filter_by(rid=rid).one_or_none()
    if not user or user.u_key_md5 != key_md5:
        return dbmsg("00")
    else:
        return dbmsg(data={
            "uid": user.uid
        })


def user_register(rid: str, key_md5:str, name:str, avatar:str, desc:str):
    # check limits
    if len(rid) > 16 or \
       len(key_md5) > 32 or \
       len(name) > 32 or \
       len(avatar) > 32 or \
       len(desc) > 128:
        return dbmsg("s1")

    session = Session()
    # 检查用户名可用性
    if session.query(User).filter(User.rid == rid).one_or_none():
        return dbmsg("11")
    user = User(
        rid=rid,
        u_key_md5=key_md5,
        reg_time=datetime.datetime.today(),
        name=name,
        avatar=avatar,
        status=0
    )
    session.add(user)
    session.commit()
    return dbmsg()


def create_notebook(rid:str, name:str, creator_id:int, desc:str, write_list:list):
    # 检查 rid、名称、描述的长度
    if len(rid) > 16 or \
       len(name) > 32 or \
       len(desc) >128:
        return dbmsg("s1")


    # 写权限拥有人数过多
    if len(write_list) > 9:
        return dbmsg("63")

    # 存在同样的笔记本
    session = Session()
    if session.query(Notebook).filter(Notebook.rid == rid).one_or_none():
        return dbmsg("61")

    # 如果写权限列表为空，则默认是公开笔记本
    if len(write_list) == 0:
        mode = 2
    # 写权限列表长度为1，则为仅作者可写
    elif len(write_list) == 1:
        mode = 0
    # 否则是多人可写
    else:
        mode = 4

    # 写权限列表的第一个人必须是创建者
    if len(write_list) > 0 and write_list[0] != creator_id:
        return dbmsg("s2")

    # 检查写权限用户是否存在
    for uid in write_list:
        if not session.query(User).filter(User.uid == uid).one_or_none():
            return dbmsg("21")

    notebook = Notebook(
        rid=rid,
        name=name,
        creator=creator_id,
        create_time=datetime.datetime.today(),
        desc=desc,
        mode=mode,
        content_length=0
    )

    session.add(notebook)
    notebook = session.query(Notebook).filter_by(rid=rid).one()
    session.add(UserNotebookMode(
        uid=creator_id,
        nid=notebook.nid,
        write_auth=1,
        show_mode=1
    ))
    for uid in write_list[1:]:
        session.add(UserNotebookMode(
            uid=uid,
            nid=notebook.nid,
            write_auth=0,
            show_mode=0
        ))
    session.commit()
    return dbmsg("ok")


def auth_notebook(uid, nid):
    session = Session()
    user = session.query(User).filter_by(uid=uid).one_or_none()
    if not user:
        return dbmsg("21")
    notebook = session.query(Notebook).filter_by(nid=nid).one_or_none()
    if not notebook:
        return dbmsg("31")
    user_notebook_mode = session.query(UserNotebookMode).\
        filter_by(nid=nid, uid=uid).one_or_none()
    if not user_notebook_mode:
        return dbmsg("71")
    user_notebook_mode.write_auth = 1
    session.commit()
    return dbmsg("ok")


# 根据 uid 获得简单的账户信息
def get_simple_account_info(account_id):
    session = Session()
    if type(account_id) is int:
        user = session.query(User).filter_by(uid=account_id).one_or_none()
    elif type(account_id) is str:
        user = session.query(User).filter_by(rid=account_id).one_or_none()
    else:
        return dbmsg("s0")
    if not user:
        return dbmsg("21")
    res = {
        "id": [user.uid, user.rid],
        "name": user.name,
        "avatar": user.avatar
    }
    return dbmsg(data=res)


# 获得自己的账户信息
def get_my_account_info(uid:int):
    session = Session()
    user = session.query(User).filter_by(uid=uid).one_or_none()
    if not user:
        return dbmsg("21")
    notebooks = session.query(UserNotebookMode).\
        filter(uid==uid, or_(UserNotebookMode.write_auth==1,
                             UserNotebookMode.show_mode==1))
    notebooks_json = []
    for notebook_mode in notebooks:
        notebook = notebook_mode.notebook
        writers = session.query(UserNotebookMode).\
            filter_by(nid=notebook.nid).all()
        writer_arr = [[{"user_id": [writer.uid, writer.user.rid],
                        "user_auth": writer.write_auth,
                        "name": writer.user.name,
                        "avatar": writer.user.avatar}]
                      for writer in writers]
        notebooks_json.append({
            "id": [notebook.nid, notebook.rid],
            "name": notebook.name,
            "creator": notebook.creator,
            "desc": notebook.desc,
            "writers": writer_arr,
            "mode": notebook.mode,
            "public": notebook_mode.show_mode,
            "length": notebook.content_length
        })
    res = {
        "user_id": [uid, user.rid],
        "name": user.name,
        "avatar": user.avatar,
        "notebooks": notebooks_json
    }
    return dbmsg(data=res)


'''
    rid 可以是 int 也可以是 str 
'''
def get_account_info(account_id):
    session = Session()
    if type(account_id) == str:
        user = session.query(User).filter_by(rid=account_id).one_or_none()
    elif type(account_id) == int:
        user = session.query(User).filter_by(uid=account_id).one_or_none()
    else:
        return dbmsg("s0")
    if not user:
        return dbmsg("21")
    open_notebook_modes = session.query(UserNotebookMode).\
        filter(UserNotebookMode.uid == user.uid,
               UserNotebookMode.show_mode == 1,
               or_(UserNotebookMode.write_auth == 1, UserNotebookMode.write_auth == 2))
    open_notebooks = [mode.notebook for mode in open_notebook_modes]
    notebooks_json = []
    # 返回该账户公开在主页上的笔记本
    for open_notebook in open_notebooks:
        # 该笔记本的写权限仍然在接受中
        if open_notebook.mode == 4:
            continue
        writers = [{"user_id": [ writer.uid, writer.user.rid ],
                    "name": writer.user.name,
                    "avatar": writer.user.avatar }
                   for writer in open_notebook.preferred_writers]
        notebooks_json.append({
            "notebook_id": [open_notebook.nid, open_notebook.rid],
            "notebook_name": open_notebook.name,
            "notebook_desc": open_notebook.desc,
            "notebook_writers":writers
        })
    res = {
        "user_id": [user.uid, user.rid],
        "name": user.name,
        "avatar": user.avatar,
        "open_notebooks": notebooks_json
    }
    return dbmsg(data=res)


def get_my_unauthed_notebooks(uid:int):
    session = Session()
    notebooks = session.query(UserNotebookMode).\
        filter(User.uid == uid, UserNotebookMode.write_auth == 0).all()
    notebooks_json = []
    for notebook_mode in notebooks:
        notebook = notebook_mode.notebook
        writers = session.query(UserNotebookMode).\
            filter_by(nid=notebook.nid).all()
        writer_arr = [{"user_id": [writer.uid,writer.user.rid],
                        "write_auth": writer.write_auth,
                        "name": writers.user.name,
                        "avatar": writers.user.avatar}
                      for writer in writers]
        authed_writers = [writer for writer in writer_arr if writer["write_auth"] == 1]
        unauthed_writers = [writer for writer in writer_arr if writer["write_auth"] == 0]
        rejected_writers = [writer for writer in writer_arr if writer["write_auth"] == 0]
        notebooks_json.append({
            "notebook_id": [notebook.nid, notebook.rid],
            "name": notebook.name,
            "creator": notebook.creator,
            "authed_writers": authed_writers,
            "unauthed_writers": unauthed_writers,
            "rejected_writers": rejected_writers,
            "mode": notebook.mode,
            "public": notebook_mode.show_mode
        })
    return dbmsg(data=notebooks_json)


# 第三方查看笔记本信息
def get_notebook_info(rid):
    session = Session()
    if type(rid) is int:
        notebook = session.query(Notebook).filter(Notebook.nid == rid).\
            one_or_none()
    elif type(rid) is str:
        notebook = session.query(Notebook).filter(Notebook.rid == rid).\
            one_or_none()
    else:
        return dbmsg("s0")
    if not notebook:
        return dbmsg("31")
    nid = notebook.nid
    # 此时只查看得到已经同意写该笔记本的用户作为笔记本作者
    writers = session.query(UserNotebookMode).filter_by(nid=nid, write_auth=1).all()
    writers = [writer.user for writer in writers]
    writers_json = [{
        "user_id": [writer.uid, writer.rid],
        "name": writer.name,
        "avatar": writer.avatar
    } for writer in writers]
    res = {
        "id": [notebook.nid, notebook.rid],
        "name": notebook.name,
        "desc": notebook.desc,
        "writers": writers_json,
        "length": notebook.content_length
    }
    return dbmsg(data=res)


def get_notebook_contents(nid:int, start:int, end:int, uid=None):
    session = Session()
    notebook = session.query(Notebook).filter_by(nid=nid)
    if not notebook:
        return dbmsg("31")
    contents = session.query(NotebookContent).filter_by(nid=nid).\
        order_by(NotebookContent.cid)[start:end]
    res = []
    for content in contents:
        content_info = {
            "cid": content.cid,
            "uid": content.uid,
            "time": str(content.time),
            "content": content.content,
            "imgs": content.imgs,
            "floor": content.floor,
            "ref":content.ref,
            "author": {
                "id": [content.author.uid, content.author.rid],
                "name": content.author.name,
                "avatar": content.author.avatar
            }
        }
        upvote_count = session.query(VoteHistory).\
            filter_by(cid = content.cid, vote_type=0).count()
        downvote_count = session.query(VoteHistory).\
            filter_by(cid=content.cid, vote_type=1).count()
        reward_sum = session.query(f.sum(VoteHistory.amount)).\
            filter_by(cid=content.cid, vote_type=3).scalar()
        if reward_sum == None:
            reward_sum = 0
        else:
            reward_sum = int(reward_sum)
        if uid:
            my_upvote = session.query(VoteHistory).\
                filter_by(cid = content.cid, uid=uid, vote_type=0).count()
            my_downvote = session.query(VoteHistory).\
                filter_by(cid=content.cid, vote_type=1, uid=uid).count()
            my_reward = session.query(f.sum(VoteHistory.amount)).\
                filter_by(cid=content.cid, uid=uid, vote_type=2).scalar()
        else:
            my_upvote = 0
            my_downvote = 0
            my_reward = 0
        content_info["upvote"] = [upvote_count, my_upvote]
        content_info["downvote"] = [downvote_count, my_downvote]
        content_info["reward"] = [reward_sum, my_reward]
        res.append(content_info)
    return dbmsg(data=res)


def write_notebook_content(uid:int, nid:int, content:str, imgs:str="", ref:int=0):
    new_content = NotebookContent(uid=uid, nid=nid,
                                  time=datetime.datetime.today(),
                                  content=content, imgs=imgs,
                                  ref=ref)
    # 检查格式
    if len(imgs) > 320:
        return dbmsg("s1")

    session = Session()
    # 检查回复的楼层是否存在
    if ref != 0:
        ref_content = session.query(NotebookContent).filter_by(nid=nid, floor=ref).\
            one_or_none()
        if not ref_content:
            return dbmsg("92")
    # 把 notebook表对应的 notebook记录锁住，防止两个事务同时发生出现错误
    notebook = session.query(Notebook).\
        filter_by(nid=nid).with_lockmode("update").one_or_none()
    if not notebook:
        return dbmsg("31")
    # 如果不是公开的笔记本，则查看是否有写权限
    if notebook.mode != 2:
        if not session.query(UserNotebookMode).filter_by(uid=uid, nid=nid, write_auth=1).\
                one_or_none():
            return dbmsg("91")
    new_content.floor = notebook.content_length + 1
    notebook.content_length += 1
    session.add(new_content)
    session.commit()
    return dbmsg("ok")


# 添加好友
# 1 表示 uid1 向 uid2 发起好友申请
# 2 表示 uid1 同意 uid2 好友申请
# 3 表示 uid1 拒绝 uid2 好友申请
# 4 表示 uid1 删除与 uid2 的好友关系
def make_friend(uid1:int, uid2:int, act:int):
    if uid1 == uid2:
        return dbmsg("52")
    session = Session()
    user_1 = session.query(User).filter_by(uid=uid1).one_or_none()
    user_2 = session.query(User).filter_by(uid=uid2).one_or_none()
    if not user_1 or not user_2:
        return dbmsg("21")
    order = uid1 < uid2
    if order:
        friends = session.query(Friends). \
            filter_by(uid1=uid1, uid2=uid2).one_or_none()
    else:
        friends = session.query(Friends). \
            filter_by(uid1=uid2, uid2=uid1).one_or_none()
    if act == 1:  # uid1 向 uid2 发出申请
        if order:
            # uid1 已经向 uid2 发出了好友申请
            if friends and friends.status == 1:
                return dbmsg("54")
            # uid2 已经向 uid1 发出了好友申请
            if friends and friends.status == 2:
                return dbmsg("55")
            # uid1 和 uid2 已经是好友关系
            if friends and friends.status == 0:
                return dbmsg("56")
            new_friends = Friends(uid1=uid1, uid2=uid2, status=1)
            session.add(new_friends)
        else:
            # uid1 已经向 uid2 发出了好友申请
            if friends and friends.status == 2:
                return dbmsg("54")
            # uid2 已经向 uid1 发出了好友申请
            if friends and friends.status == 1:
                return dbmsg("55")
            # uid1 和 uid2 已经是好友关系
            if friends and friends.status == 0:
                return dbmsg("56")
            new_friends = Friends(uid1=uid2, uid2=uid1, status=2)
            session.add(new_friends)
        session.add(new_friends)

    # uid1 同意 uid2 的申请
    elif act == 2:
        if not friends:
            return dbmsg("53")
        if order:
            if friends.status != 2:
                return dbmsg("53")
            friends.status = 0
        else:
            if friends.status != 1:
                return dbmsg("53")
            friends.status = 0

    # uid1 拒绝 uid2 的申请
    elif act == 2:
        if not friends:
            return dbmsg("53")
        if order:
            if friends.status != 2:
                return dbmsg("53")
            friends.status = 0
        else:
            if friends.status != 1:
                return dbmsg("53")
            friends.status = 0
    elif act == 3:
        if not friends:
            return dbmsg("57")
        session.delete(friends)
    else:
        return dbmsg("s0")
    session.commit()
    return dbmsg()


def get_friend_list(uid:int):
    session = Session()
    friends = session.query(Friends).filter_by(uid1=uid, status=0).union(
        session.query(Friends).filter_by(uid2=uid, status=0)
    ).all()
    friend_list = []
    for friend in friends:
        if friend.uid1 == uid:
            friend_info = session.query(User).filter_by(uid=friend.uid2).one()
        else:
            friend_info = session.query(User).filter_by(uid=friend.uid1).one()

        if friend_info:
            friend_list.append({
                "id": [friend_info.uid, friend_info.rid],
                "name": friend_info.name,
                "avatar": friend_info.avatar
            })
        else:
            friend_list.append({
                "id": [-1, "null"],
                "name": "[已删除]",
                "avatar": "lost.png"
            })

    return dbmsg(data=friend_list)

def get_my_friend_requests(uid:int):
    session = Session()
    friends = session.query(Friends).filter_by(uid1=uid, status=2).union(
        session.query(Friends).filter_by(uid2=uid, status=1)
    )
    friend_list = []
    for friend in friends:
        if friend.uid1 == uid:
            friend_info = session.query(User).filter_by(uid=friend.uid2).one()
        else:
            friend_info = session.query(User).filter_by(uid=friend.uid1).one()

        if friend_info:
            friend_list.append({
                "id": [friend_info.uid, friend_info.rid],
                "name": friend_info.name,
                "avatar": friend_info.avatar
            })
        else:
            friend_list.append({
                "id": [-1, "null"],
                "name": "[已删除]",
                "avatar": "lost.png"
            })
    return dbmsg(data=friend_list)


def get_my_friend_applications(uid:int):
    session = Session()
    user = session.query(User).filter_by(uid=uid).one_or_none
    if not user:
        return dbmsg("21")
    friends = session.query(Friends).filter_by(uid1=uid, status=1).union(
        session.query(Friends).filter_by(uid2=uid, status=2)
    )
    friend_list = []
    for friend in friends:
        if friend.uid1 == uid:
            friend_info = session.query(User).filter_by(uid=friend.uid2).one()
        else:
            friend_info = session.query(User).filter_by(uid=friend.uid1).one()
        if friend_info:
            friend_list.append({
                "rid": [friend_info.uid, friend_info.rid],
                "name": friend_info.name,
                "avatar": friend_info.avatar
            })
        else:
            friend_list.append({
                "rid": [-1, "null"],
                "name": "[已删除]",
                "avatar": "lost.png"
            })
    return dbmsg(data=friend_list)

# mode = 1: upvote
# mode = 2: downvote
# mode = 3: reward
def vote_content(cid:int, uid:int, vtype:int, amount:int=0):
    session = Session()
    content = session.query(NotebookContent).filter_by(cid=cid).one_or_none()
    nid = content.nid
    if not content:
        return dbmsg("81")
    user = session.query(User).filter_by(uid=uid).one_or_none()
    if not user:
        return dbmsg("21")
    vote = session.query(VoteHistory).\
        filter(VoteHistory.nid == nid,
               VoteHistory.cid == cid, VoteHistory.uid == uid,
               or_(VoteHistory.vote_type == 1, VoteHistory.vote_type == 2)).\
        one_or_none()
    reward = session.query(VoteHistory).\
        filter(VoteHistory.nid == nid,
               VoteHistory.cid == cid, VoteHistory.uid == uid,
               VoteHistory.vote_type == 3).\
        one_or_none()
    if vtype == 1 or vtype == 2:
        if vote is None:
            new_vote = VoteHistory(cid=cid, nid=nid, uid=uid, vote_type=vtype, amount=0,
                               time=datetime.datetime.today())
            session.add(new_vote)
        else:
            vote.vote_type = vtype
    elif vtype == 3:
        if reward is None:
            new_reward = VoteHistory(cid=cid, nid=nid, uid=uid, vote_type=vtype, amount=amount,
                                     time=datetime.datetime.today())
            session.add(new_reward)
        else:
            reward.amount += amount
    session.commit()
    return dbmsg("ok")
