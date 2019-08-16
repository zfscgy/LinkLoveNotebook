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
                    <button type="button" class="btn btn-primary" style="float:right" data-toggle="modal"
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
                            <input type="text" class="form-control" v-model="id">
                        </div>
                        <div class="form-group">
                            <div class="col-form-label">密码</div>
                            <input type="text" class="form-control" v-model="passwd">
                        </div>
                        <div class="form-group" v-if="tab=='signup'">
                            <div class="col-form-label">确认密码</div>
                            <input type="text" class="form-control" v-model="passwd_1">
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
            passwd: "",
            passwd_1: ""
        }
    },
    methods: {
        switch_tab(tab) {
            this.tab = tab
        },
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
        confirm() {}
    },
    created() {
        this.get_simple_account_info()
    }
})