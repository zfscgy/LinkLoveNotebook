from flask import Flask, send_from_directory, make_response
from flask import request
from Configs import *
import json
import Database as d
import Token as t
import traceback

def record_exception(e:Exception):
    print("Exception: " + str(e) + "\n==========")
    traceback.print_exc()


def smsg(msg:str="ok", data:dict=None):
    return {"msg":msg, "data": data}


app = Flask(__name__, static_folder=html_path, static_url_path='/web')

@app.route('/hello/')
def hello_world():
    return 'Hello World!'


@app.route('/api/login/', methods=["POST"])
def login():
    try:
        rid, key_md5 = request.json.get("id"), request.json.get("key_md5")
        res = d.login(rid, key_md5)
        if res["dbmsg"] != "ok":
            return make_response(json.dumps(smsg(data=res)))
        else:
            res["data"] = t.generate_token(res["data"])
        resp = make_response(json.dumps(smsg(data=res)))
        resp.set_cookie("token", res["data"])
        return resp
    except Exception as e:
        record_exception(e)
        return json.dumps(smsg("00"))


@app.route('/api/register/', methods=["POST"])
def register():
    try:
        rid = request.json.get("id")
        key_md5 = request.json.get("key_md5")
        name = request.json.get("name")
        avatar = request.json.get("avatar")
        desc = request.json.get("desc")
        res = d.user_register(rid, key_md5, name, avatar, desc)
        if res != "ok":
            return json.dumps(smsg(data=res))
        else:
            res = d.login(rid, key_md5)
            if res["dbmsg"] != "ok":
                return make_response(json.dumps(serverMsg(data=res)))
            else:
                res["data"] = t.generate_token(res["data"])
            resp = make_response(json.dumps(smsg(data=res)))
            resp.set_cookie("token", res["data"])
            return resp
    except Exception as e:
            record_exception(e)
            return json.dumps(smsg("00"))


@app.route('/api/account', methods=["GET"])
def get_acount_info():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    account_info = d.get_account_info(uid)
    return json.dumps(smsg(data=account_info))


@app.route('/api/myAccount/')
def get_my_account_info():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    account_info = d.get_my_account_info(uid)
    return json.dumps(smsg(data=account_info))


@app.route('/api/createNotebook/', methods=["POST"])
def create_notebook():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    rid = request.json.get("id")
    name = request.json.get("name")
    desc = request.json.get("desc")
    write_list = request.json.get("write_list")

    # Should check some constraints maybe
    res = d.create_notebook(rid, name, uid, desc, write_list)
    return json.dumps(smsg(data=res))


@app.route('/web/notebook')
def notebook():
    rid = request.args.get("id")
    if rid is None:
        return json.dumps(smsg("01"))
    notebook_info = d.get_notebook_info(rid)
    if notebook_info['dbmsg']!= "ok":
        return json.dumps(smsg(data=notebook_info))
    token = request.cookies.get("token")
    uid = None
    if token is not None:
        info = t.decode_token(token)
        if "err_msg" not in info:
            uid = info['uid']
    nid = notebook_info['data']['id'][0]
    notebook_contents = d.get_notebook_contents(nid, 0, SP.default_notebook_len, uid)
    return json.dumps(smsg(data={"info": notebook_info,
                                 "preview": notebook_contents}))

@app.route('/web/content')
def content():
    nid = request.args.get("nid")
    start = request.args.get("start", type=int)
    end = request.args.get("end", type=int)

    uid = None
    token = request.cookies.get("token")
    if token and "err_msg" not in t.decode_token(token):
        info = t.decode_token(token)
        uid = info["uid"]
    # 参数完整性
    if nid and start and end is None:
        return json.dumps(smsg("01"))
    res = d.get_notebook_contents(nid, start, end, uid)
    return json.dumps(smsg(data=res))


@app.route('/api/write/', methods=["POST"])
def write_content():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    nid = request.json.get("nid")
    content = request.json.get("content")
    imgs = request.json.get("imgs")
    ref = request.json.get("ref")
    res = d.write_notebook_content(uid, nid, content, imgs, ref)
    return json.dumps(smsg(data=res))


@app.route('/web/<p>', methods=["GET"])
def web(p):
    return send_from_directory(html_path, p)





if __name__ == '__main__':
    app.run("127.0.0.1", port=80, debug=True)
