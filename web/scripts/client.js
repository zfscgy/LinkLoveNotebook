/**
 * 该脚本在浏览器端运行
 * 该脚本负责与服务器的交互，服务器并非区块链节点（若是区块链节点，则会出现跨域调用的问题）
 * 因此服务器需要负责处理、转发此处请求，并且把区块链节点的返回值返回。
 */
let server = "http://127.0.0.1"
let dbmsgs = {
    // login
    "00": "用户名和私钥不匹配",
    // All actions
    "01": "Token已经过期，请重新登录",
    "02": "Token验证失败",
    "03": "服务器无法连接区块链节点",
    "04": "无法连接服务器，请检查网络连接",
    // register_account
    "11": "该id已经被注册",
    // get_account_info

    // 对应的data：该id
    "21": "无法找到该id对应的用户",
    // get_my_notebook_info
    "31": "无法找到该id对应的笔记本",
    "34": "该id对应的笔记本不是我的笔记本",
    // get_notebook_contents
    "41": "start、end下标不合法",
    // make_friend
    "51": "好友操作未定义",
    "52": "不能向自己发起好友申请",
    "53": "无法同意/拒绝不存在的好友申请",
    "54": "已经发送同样的好友申请",
    "55": "对方已经发起好友申请",
    "56": "对方已经是你的好友",
    "57": "对方尚未是你的好友，无法删除",
    // create_notebook
    "61": "该笔记本id已经被注册",
    "62": "无法找到该写权限用户的id",
    "63": "笔记本写权限人数超出限制",
    // write_notebook_content
    "91": "不具有对该笔记本的写权限",
    "92": "引用的楼层不存在",
    // auth_notebook
    "71": "无法找到对应的用户-笔记本记录",
    "72": "你已经接受写权限",
    "73": "你已经拒绝写权限",
    "74": "该笔记本是公开笔记本，操作无效",
    // vote_contetn
    "81": "无法找到该id对应的笔记本内容",
    // string length check failed
    "s0": "查询格式错误",
    "s1": "字符串长度超标",
    "s2": "笔记本写权限列表第一个应该是笔记本创建者"
}

let smsgs = {
    "00": "服务器运行出错",
    "01": "API请求参数错误",
    "02": "Token已经过期，请重新登录",
    "03": "Token无效",
    "04": "无法获取token，请重新登录，并检查浏览器Cookie设置"
}
/**
 * type:
 * account_id
 * account_name
 * notebook_id
 * notebook_name
 */
let check_syntax = function (type, input) {
    if (input == null) {
        return false
    }
    switch (type) {
        case "account_id":
        case "notebook_id":
            return /^[a-zA-Z][0-9a-zA-Z_]*$/.test(input) && input.length <= 16
        case "account_name":
        case "notebook_name":
            return input.length <= 32
        default:
            console.log("Error, not correct input type")
            return false
    }
}
let client =
{
    /**
     * 参数：
     * id: 用户名
     * priv_key: 用户的私钥
     * 返回：
     * token: 用于身份确认，有一定的有效期
     * 
     */
    login(id, priv_key, next) {
        let key_md5 = md5(id + priv_key)
        let post_data = {
            "id": id,
            "key_md5": key_md5
        }
        axios.post(server + "/api/login/", post_data,
            {
                "headers": { "content-type": "application/json" }
            }
        )
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },

    /**
     * 参数：
     * id: 用户唯一id,
     * priv_key: 私钥
     * name: 用户姓名,
     * avatar: 用户头像地址
     * 
     */
    register_account(id, priv_key, name, avatar, desc, next) {
        let key_md5 = md5(id + priv_key)
        let post_data = {
            "id": id,
            "key_md5": key_md5,
            "name": name,
            "avatar": avatar,
            "desc": desc
        }
        axios.post(server + "/api/register/", post_data,
            {
                "headers": { "content-type": "application/json" }
            })
            .then(res => {
                next.then(res.data)
            })
            .catch(err => {
                next.catch(err)
            })
        return { msg: "ok" }
    },

    /** 
     * 参数：
     * token
     * 返回：
     * account_info 账户信息：
     * { user_id: 唯一用户名
     * name: 姓名
     * avatar: 头像路径
     * notebooks 拥有的笔记本: [{ notebook_id 笔记本唯一ID, name 笔记本名称, creator 创建者, desc 笔记本描述,  writers: [] 笔记本写权限拥有者(id的数组，如果为空数组则是公开笔记本), public 笔记本是否在主页上公开},]
     * }
     */
    get_my_account_info(next) {
        axios.get(server + "/api/myAccount")
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },

    /**
     * 参数：
     * user_id
     * 返回
     * account_info: {[ uid,id ], name, avatar} 
     */
    get_simple_account_info(user_id) {
        return { data: simple_info, msg: "ok" }
    },

    /**
     * 参数：
     * user_id
     * 返回：
     * account_info
     * {
     *     name: 姓名
     *     avatar: 头像
     *     notebooks: [ notebook: {notebook_id 笔记本唯一ID, name 笔记本名称, desc 笔记本描述} ]
     * }
     */

    get_account_info(user_id) {
        return { data: account_info, msg: "ok" }
    },


    /**
     * 参数：
     * token
     * notebook_id
     * notebook_auth 笔记本权限: [ author: 写权限拥有者 ] 若列表为空，表示任何人具有写权限
     * notebook_name: 笔记本名称,
     * notebook_desc: 笔记本描述
     * 返回：
     * notebook_info
     */

    create_notebook(id, writers, name, desc, public, next) {
        axios.post(server + "/api/createNotebook/",
            {
                "id": id,
                "name": name,
                "desc": desc,
                "writers_list": writers,
                "public": public
            },
            {
                "headers": {
                    "content-type": "application/json"
                }
            })
            .then(res => {
                next.then(res.data)
            })
            .catch(err => {
                next.catch(err)
            })
    },

    /**
     * 参数：
     * token
     * 返回：
     * unauthed_notebooks: 未认证的笔记本申请 [{ name: 笔记本名称, desc: 笔记本描述, creator: 笔记本创建人, create_time: 笔记本创建时间, authed_authors: 已经同意的 }]
     *  
     */
    get_my_unauthed_notebook(token) {
        return { data: unauthed_notebooks, msg: "ok" }
    },

    /** 
     * 
    */
    auth_notebook(token, notebook_id) {
        return { msg: "ok" }
    },


    /**
     * 参数：
     * notebook_id
     * 返回：
     * {
     *  info: 笔记本信息：
     *  {   
     *      notebook_id 笔记本唯一ID,   
     *      name 笔记本名称, 
     *      desc 笔记本描述,  
     *      writers: [] 笔记本写权限拥有者(id的数组，如果为空数组则是公开笔记本), 
     *      length: 笔记本当前长度
     *  }
     *  preview: 笔记本前20条内容
     *  [{
     *      cid,
     *      uid,
     *      time,
     *      content,
     *      floor,
     *      ref,
     *      author: [{id: [{uid, rid}], name, avatar}],
     *      upvote: [cnt, my]
     *      downvote: [cnt, my]
     *      reward: [sum, my]
     *  }]
     */
    get_notebook_info(notebook_id, next) {
        axios.get(server + "/api/notebook", {
            params: {
                id: notebook_id
            }
        })
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },


    /**
     * 参数：
     * notebook_id: 笔记本唯一id
     * start, end: 内容索引范围
     * 返回：
     * contents 内容列表: [{ notebook_id 笔记本唯一ID, author_id 作者用户名, time 发表时间, text 内容, pic_list 图片列表 }]
     */
    get_notebook_contents(nid, start, end, next) {
        axios.get(server + "/api/content", {
            params: {
                nid: nid,
                start: start,
                end: end
            }
        })
            .then(res => {
                next.then(res.data)
            })
            .catch(err => {
                next.catch(err)
            })
    },


    /**
     * 参数：
     * 无
     * 返回：
     * friends: 
     * [{   
     *      id: [uid, rid],
     *      name:
     *      avatar: 
     * }]
     */
    get_friends(next) {
        axios.get(server + "/api/myFriends/")
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },

    get_friend_requests(next) {
        axios.get(server + "/api/friendRequests")
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },

    /**
     * 参数：
     * notebook_id
     * content 内容
     * imgs 图片列表
     * ref 引用楼层（默认为0楼）
     */
    write_notebook_content(notebook_id, content, imgs, ref, next) {
        axios.post(server + "/api/write/", {
            nid: notebook_id,
            content: content,
            imgs: imgs,
            ref: ref
        },
            {
                headers: {
                    "content-type": "application/json"
                }
            })
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    },

    /**
     * 参数：
     * token
     * user_id: 可以是 rid(string), 或者是 uid(int)
     * action: 1 添加, 2 同意 3 拒绝 4 删除
     */
    make_friend(user_id, action, next) {
        axios.get(
            server + "/api/befriend",
            {
                params: {
                    u2: user_id,
                    act: action
                }
            })
            .then(res => {
                next.then(res.data)
            })
            .catch(err => { next.catch(err) })
        return { msg: "ok" }
    },

    /**
     * 
     */
    get_unauthed_notebooks(next) {
        axios.get(server + "/api/notebookRequests")
            .then(res => { console.log(res);next.then(res.data) })
            .catch(err => { next.catch(err) })
    },
    /**,
     * 参数
     * nid: 对应的笔记本nid
     * act: 1 接受 2 拒绝
     */
    auth_notebook(nid, act, next) {
        axios.get(server + "/api/notebookAuth",
            {
                params: {
                    nid: nid,
                    act: act
                }
            })
            .then(res => { next.then(res.data) })
            .catch(err => { next.catch(err) })
    }
}