/**
 * 该脚本在浏览器端运行
 * 该脚本负责与服务器的交互，服务器并非区块链节点（若是区块链节点，则会出现跨域调用的问题）
 * 因此服务器需要负责处理、转发此处请求，并且把区块链节点的返回值返回。
 */
let msgs = {
    // login
    "00": "未找到该私钥对应的账户，请先注册",
    // All actions
    "01": "Token已经过期，请重新登录",
    "02": "Token验证失败",
    "03": "服务器无法连接区块链节点",
    "04": "无法连接服务器，请检查网络连接",
    // register_account
    "11": "该id已经被注册",
    // get_account_info
    "21": "无法找到该id对应的用户",
    // get_my_notebook_info
    "31": "无法找到该id对应的笔记本",
    "34": "该id对应的笔记本不是我的笔记本",
    // get_notebook_contents
    "41": "start、end下标不合法",
    // make_friend
    "51": "好友操作未定义",
    // create_notebook
    "61": "该笔记本id已经被注册",
    "62": "无法找到该写权限用户的id"
}
/**
 * 参数：
 * priv_key: 用户的私钥
 * 返回：
 * token: 用于身份确认，有一定的有效期
 * 
 */
function login(priv_key) {
    return { token, msg: "ok" }
}

/**
 * 参数：
 * priv_key
 * register_info 注册信息: 
 * {
 *  account_id: 用户唯一id,
 *  name: 用户姓名
 * }
 */
function register_account(priv_key, register_info) {
    return { token, msg: "ok" }
}

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
function get_my_account_info(token) {
    return { data: account_info, msg: "ok" }
}

/**
 * 参数：
 * user_id
 * 返回
 * account_info: {[ uid,id ], name, avatar} 
 */
function get_simple_account_info(user_id) {
    return { data: simple_info, msg:"ok" }
}

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

function get_account_info(user_id) {
    return { data: account_info, msg: "ok" }
}


/**
 * 参数：
 * token
 * notebook_id
 * notebook_auth 笔记本权限: [ author: 写权限拥有者 ] 若列表为空，表示任何人具有写权限
 * notebook_info 笔记本信息: { name: 笔记本名称, desc: 笔记本描述}
 * 返回：
 * notebook_info
 */

function create_notebook(token, notebook_id, notebook_auth, notebook_info) {
    return { data: notebook_info, msg: "ok" }
}

/**
 * 参数：
 * token
 * 返回：
 * unauthed_notebooks: 未认证的笔记本申请 [{ name: 笔记本名称, desc: 笔记本描述, creator: 笔记本创建人, create_time: 笔记本创建时间, authed_authors: 已经同意的 }]
 *  
 */
function get_my_unauthed_notebook(token) {
    return {data: unauthed_notebooks, msg: "ok" }
}

/** 
 * 
*/
function auth_notebook(token, notebook_id) {
    return { msg: "ok" } 
}


/**
 * 参数：
 * notebook_id
 * 返回：
 * notebook_info 笔记本信息：
 * { notebook_id 笔记本唯一ID, name 笔记本名称, desc 笔记本描述,  writers: [] 笔记本写权限拥有者(id的数组，如果为空数组则是公开笔记本), length: 笔记本当前长度}
 * 
 */
function get_notebook_info(notebook_id) {
    return { data: notebook_info, msg: "ok" }
}


/**
 * 参数：
 * notebook_id: 笔记本唯一id
 * start, end: 内容索引范围
 * 返回：
 * contents 内容列表: [{ notebook_id 笔记本唯一ID, author_id 作者用户名, time 发表时间, text 内容, pic_list 图片列表 }]
 */
function get_notebook_contents(notebook_id, start, end) {
    return { data: contents, msg: "ok" }
}


/**
 * 参数：
 * token:
 * 返回：
 * friends: [ user_id: 好友的id ]
 */
function get_friends(token) {
    return { data: friends, msg: "ok" }
}

/**
 * 参数：
 * token
 * notebook_id
 * content 内容: {text 文本内容, pic_list 图片列表}
 */
function write_notebook_content(token, notebook_id, content) {
    return { msg: "ok" }
}

/**
 * 参数：
 * token
 * user_id
 * action: "add" 添加, "del" 删除 
 */
function make_friend(token, user_id, action) {
    return { msg: "ok" }
}

/**
 * 
 */
