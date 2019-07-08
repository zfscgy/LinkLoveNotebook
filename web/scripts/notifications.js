let notfis = new Vue({
    el: "#notifications",
    data: {
        avatar: "res/imgs/img1.jpg",
        cur_tab: "my_proposals",
        my_proposals: [{
            name: "笔记本1",
            creator: [{ id: [0, 'zfscgy'], name: "zf", avatar: "res/imgs/img1.jpg" }],
            desc: "My first notebook proposal",
            authed: [{ id: [0, 'zfscgy'], name: "zf", avatar: "res/imgs/img1.jpg" }],
            rejeted: [],
            unauthed: [{ id: [1, 'cwk'], name: "cwk", avatar: "res/imgs/img1.jpg" }],
        }],
        unauthed_proposals: [{
            name: "笔记本2",
            creator: { id: [1, 'cwk'], name: "cwk", avatar: "res/imgs/img1.jpg" },
            desc: "FLXG",
            authed: [{ id: [1, 'cwk'], name: "cwk", avatar: "res/imgs/img1.jpg" }],
            rejeted: [],
            unauthed: [{ id: [0, 'zfscgy'], name: "zf", avatar: "res/imgs/img1.jpg" }]
        }],
        friend_requests: [
        ],
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
        get_unauthed_notebooks: function() {
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
        }
    }
})
notfis.get_friend_requests()
notfis.get_unauthed_notebooks()