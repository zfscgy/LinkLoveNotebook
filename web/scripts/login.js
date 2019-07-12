let next = {
    then(res) {
        console.log(res)
        if (res.msg == 'ok') {
            if (res.data.dbmsg == "ok") {
                window.location = "account.html"
            }
            else {
                let err_msg = dbmsgs[res["data"]["dbmsg"]]
                alert(err_msg)
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
let login = new Vue({
    el: "#login",
    data: {
        // "login-tab" for login, 
        // "register-tab" for register
        selected: "login-tab",
        input: {
            id: "",
            priv_key: "",
            priv_key_2: "",
            name: ""
        }
    },
    methods: {
        switch_tab(event) {
            console.log("Switch tab to " + event.currentTarget.id)
            this.selected = event.currentTarget.id
        },
        check_password() {
            return this.input.priv_key == this.input.priv_key_2
        },
        register() {
            if(!this.check_password()) {
                alert("密码前后输入不一致，请重新输入")
                return
            }
            let res = client.register_account(this.input.id, this.input.priv_key, this.input.name, "/web/res/imgs/img1.jpg", "", next)
        },
        login() {
            let res = client.login(this.input.id, this.input.priv_key, next)
        }
    }
})