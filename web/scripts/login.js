let login = new Vue({
    el: "#login",
    data: {
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
    },
    methods: {
        get_simple_account_info() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok" && res.data.dbmsg == "ok") {
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
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
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
            window.location = "/web/account.html"
        }
    }
})