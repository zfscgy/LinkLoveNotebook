Vue.component('notebook-header', {
    template:
        `<div>
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <a class="navbar-brand" href="#">链恋笔记本</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-list">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbar-list">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active"><a class="nav-link" href="account.html">个人中心</a></li>
                    <li class="nav-item"><a class="nav-link" href="explore.html">发现</a></li>
                </ul>
                <div>
                    <a v-if="logined" href="notifications.html">
                        <img v-bind:src="account_info.avatar"
                            style="height: 2rem; width: 2rem; border-radius: 0.3rem">
                    </a>
                    <button v-if="!logined" type="button" class="btn btn-primary" style="float:right" data-toggle="modal"
                        data-target="#login-modal">登录</button>
                </div>
            </div>
        </nav>
        <div id="login-modal" class="modal fade">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <ul class="nav nav-tabs">
                            <li class="nav-item"><a class="nav-link" v-bind:class="{'active':tab=='signin'}"
                                    v-on:click="switch_tab('signin')" href="#">登录</a>
                            </li>
                            <li class="nav-item"><a class="nav-link" v-bind:class="{'active':tab=='signup'}"
                                    v-on:click="switch_tab('signup')" href="#">注册</a>
                            </li>
                        </ul>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <div class="col-form-label">用户名</div>
                            <div class="zf-error-lable" v-show="tab=='signup' && !v_check_syntax('account_id', id)">
                                不多于64字符的数字、字母、下划线组合，且开头为字母
                            </div>
                            <input type="text" class="form-control" maxlength="64" v-model="id">
                        </div>
                        <div class="form-group">
                            <div class="col-form-label">密码</div>
                            <input type="password" class="form-control" v-model="passwd">
                        </div>
                        <div class="form-group" v-if="tab=='signup'">
                            <div class="zf-error-lable" v-show="!check_password()">
                            两次输入的密码应该一样</div>
                            <div class="col-form-label">确认密码</div>
                            <input type="password" class="form-control" v-model="passwd_1">
                        </div>
                        <div class="form-group" v-if="tab=='signup'">
                            <div class="col-form-label">昵称</div>
                            <input type="text" class="form-control" v-model="name" maxlength="64">
                        </div>
                        <div v-if="tab=='signup'">
                            <div class="col-form-label">性别</div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="gender" v-model="gender" value="1" checked>
                                <label class="form-check-label" for="exampleRadios1">男</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="gender" v-model="gender" value="0" checked>
                                <label class="form-check-label" for="exampleRadios1">女</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary"
                            v-on:click="confirm">确认</button>
                    </div>
                </div>
            </div>
        </div>
        </div>`,
    props: ['myMessage'],
    data: function() {
        return {
            logined: false,
            tab: 'signin',
            ch:{
                'signin': '登录',
                'signup': '注册'
            },
            account_info: {
                avatar: ""
            },
            id: "",
            name: "",
            passwd: "",
            passwd_1: "",
            gender: 0
        }
    },
    methods: {
        get_simple_account_info() {
            let that = this
            let next = {
                then(res) {
                    if(res.msg == "ok" && res.data.dbmsg == "ok") {
                        that.logined = true 
                        that.account_info = res.data.data
                    }
                    else {
                        
                    }
                    console.log(that.account_info)
                },
                catch(err) {
                    console.log(err)
                }
            }
            client.get_simple_account_info(-1, next)
        },
        v_check_syntax(type, input) {
            return check_syntax(type, input)
        },
        switch_tab(tab) {
            this.tab = tab
        },
        check_password() {
            return this.passwd == this.passwd_1
        },
        confirm() {
            let that = this
            let next = {
                then(res) {
                    if(res.msg == "ok") {
                        if(res.data.dbmsg == "ok") {
                            that.logined = true
                            that.get_simple_account_info()
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                    else {
                        alert(smsgs[res.msg])
                    }
                },
                catch(err) {
                    alert(err)
                    console.log(err)
                }
            }
            if (this.tab == "signin") {
                client.login(this.id, this.passwd, next)
            }
            else {
                let avatars = ["/web/res/imgs/img2.jpg", "/web/res/imgs/img1.jpg"]
                client.register_account(this.id, this.passwd, this.name, avatars[this.gender], "", this.gender, next)
            }
        }
    },
    created() {
        this.get_simple_account_info()
    }
})