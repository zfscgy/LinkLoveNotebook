let notifs = new Vue({
    el: "#notifications",
    data: {
        account_info: {
            "avatar": ""
        },
        cur_tab: "my_proposals",
        my_proposals: [],
        unauthed_proposals: [],
        friend_requests: [],
        my_applications: [],
        points: 0
    },
    methods: {
        change_tab: function (e) {
            this.cur_tab = e.currentTarget.id
        },
        get_friend_requests: function () {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            that.friend_requests = res.data.data
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
                    alert(error)
                }
            }
            client.get_friend_requests(next)
        },
        get_my_friend_applications() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            that.my_applications = res.data.data
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
                    alert(error)
                }
            }
            client.get_friend_applications(next)
        },
        friend_operation: function (uid, act) {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            console.log(res)
                            that.get_friend_requests({
                                next(res) {
                                    that.friend_requests = res.data.data
                                },
                                catch(err) {
                                    console.log(err)
                                    alert(err)
                                }
                            })
                            alert('添加好友成功！')
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
            client.make_friend(uid, act, next)
        },
        get_my_notebook_proposals() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            that.my_proposals = res.data.data
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.get_my_notebook_proposals(next)
        },
        get_unauthed_notebooks: function () {
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            that.unauthed_proposals = res.data.data
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.get_unauthed_notebooks(next)
        },
        auth_notebook: function (nid, act) {
            let that = this
            let word = ["接受", "拒绝"]
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            alert("您已经成功" + word[act - 1] + "该笔记本邀请")
                            that.get_unauthed_notebooks()
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.auth_notebook(nid, act, next)
        }
    }
})
notifs.get_friend_requests()
notifs.get_my_notebook_proposals()
notifs.get_unauthed_notebooks()
client.get_my_account_info({
    then(res) {
        if (res.msg == "ok" && res.data.dbmsg == "ok") {
            notifs.account_info = res.data.data
            client.get_account_points(
                notifs.account_info.id[0],
                {
                    then(res) {
                        if (res.msg == "ok" && res.data.dbmsg == "ok") {
                            notifs.points = res.data.data
                        }
                    },
                    catch(err) {
                        console.log(err)
                    }
                })
        }
    },
    catch(err) {
        console.log(err)
    }
})