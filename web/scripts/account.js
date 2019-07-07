var account = new Vue({
    el: "#account",
    data: {
        account_info: {
            name: "未登录",
            avatar: "res/imgs/img1.jpg",
            friends: [],
            notebooks: []
        },
        input: {
            new_notebook_modal:
            {
                id: "",
                name: "",
                desc: "",
                mode: ""
            },
            new_friend_modal:
            {
                id: ""
            }
        },
        current_page: 1,
        notebooks_perpage: 10
    },
    methods: {
        v_check_syntax(type, input) {
            return check_syntax(type, input)
        },
        get_my_info() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            that.account_info = res.data.data
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
                    console.log(err)
                }
            }
            client.get_my_account_info(next)
        },
        get_friend_list() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            this.account_info.friends = res.data.data
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                    else {
                        alert(smsgs[res.msg])
                    }
                }
            }
        },
        create_notebook() {
            if (!check_syntax("notebook_name", this.input.new_notebook_modal.name) ||
                !check_syntax("notebook_id", this.input.new_notebook_modal.name)) {
                alert("请检查输入！")
                return
            }
            let that = this
            let next = {
                then(res) {
                    if (res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if (res.data.dbmsg != "ok") {
                        alert(smsgs[res.data.dbmsg])
                    }
                    else {
                        alert('笔记本创建成功')
                        that.get_my_info()
                        $("#new-notebook-modal").modal('hide')
                    }

                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.create_notebook("", this.input.new_notebook_modal.id, this.input.new_notebook_modal.mode,
                this.input.new_notebook_modal.name, this.input.new_notebook_modal.desc, next)

        },
        add_friend(id) {
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            alert("好友请求已经发出")
                            $("#new-friend-modal").modal('hide')
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
                    console.log(err)
                    alert(err)
                }
            }
            client.make_friend(id, 1, next)
        }
    }
})
account.get_my_info()
account.get_friend_list()