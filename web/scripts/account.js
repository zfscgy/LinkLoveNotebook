var account = new Vue({
    el: "#account",
    data: {
        account_info: {
            name: "未登录",
            avatar: "res/imgs/img1.jpg",
            public_notebooks: [],
            private_notebooks: []
        },
        friends: [],
        input: {
            new_notebook_modal:
            {
                id: "",
                name: "",
                desc: "",
                private_mode: false,
                public: false,
                writers_str: ""
            },
            new_friend_modal:
            {
                id: ""
            },
            login:
            {
                rid:"",
                pw:""
            }
        },
        tab: "public",
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
                            console.log("Get friend list:", res)
                            that.friends = res.data.data
                            console.log(that.account_info)
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
            client.get_friends(next)
        },
        //UI触发事件
        switch_tab(tab) {
            this.tab = tab
        },
        create_notebook() {
            if (!check_syntax("notebook_name", this.input.new_notebook_modal.name) ||
                !check_syntax("notebook_id", this.input.new_notebook_modal.id)) {
                alert("请检查输入！")
                return
            }
            let writers = [this.account_info.id[1]]
            // 如果在private mode, 则写权限数组不为空
            if (this.input.new_notebook_modal.private_mode) {
                if(this.input.new_notebook_modal.writers_str.length > 0) {
                    writers = writers.concat(this.input.new_notebook_modal.writers_str.trim().split(' '))
                }
            }
            else { // 如果是公共笔记本，则writers数组为空
                writers = []
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
            client.create_notebook(this.input.new_notebook_modal.id, writers,
                this.input.new_notebook_modal.name, this.input.new_notebook_modal.desc, 
                Number(this.input.new_notebook_modal.public), next)

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