var notebook = new Vue({
    el: "#notebook",
    data: {
        info: {
            id: ["", -1],
            name: "",
            author: {
                name: "",
                avatar: ""
            }
        },
        input: {
            new_content: ""
        },
        contents: [],
        content_start: 0,
        content_end: 20,
        reward: {
            floor: 0,
            cid: null,
            author: {
                "avatar": "",
                "id": [null, null],
                "name": ""
            },
            amount: 0
        }
    },
    methods: {
        get_notebook() {
            let params = window.location.search.substring(1).split('&')
            let para_dict = new Array()
            for (var i in params) {
                let p = params[i].split('=')
                para_dict[p[0]] = p[1]
            }
            let id = para_dict["id"]
            let that = this
            let next = {
                then(res) {
                    if (res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if (res.data.info.dbmsg != "ok") {
                        alert(dbmsgs[res.data.info.dbmsg])
                    }
                    else {
                        that.info = res.data.info.data
                        that.contents = res.data.preview.data
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.get_notebook_info(id, next)
        },
        refresh_content() {
            console.log(this.info)
            let nid = this.info.id[0]
            let that = this
            client.get_notebook_contents(nid, 0, this.content_end + 20,
                {
                    then(res) {
                        if (res.msg != "ok") {
                            alert(smsgs[res.msg])
                        }
                        else if (res.data.dbmsg != "ok") {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                        else {
                            that.contents = that.contents.concat(
                                res.data.data.slice(that.content_end, res.data.data.length))
                            that.content_end = res.data.data.length
                        }
                    },
                    catch(err) {
                        console.log(err)
                        alert(err)
                    }
                })
        },
        write_new_content() {
            let that = this
            let next = {
                then(res) {
                    if (res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if (res.data.dbmsg != "ok") {
                        alert(dbmsgs[res.data.dbmsg])
                    }
                    else {
                        that.input.new_content = ""
                        that.refresh_content()
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            let nid = this.info.id[0]
            client.write_notebook_content(nid, this.input.new_content, "", 0, next)
        },
        /**
         * cid
         * voted: 0 未赞/踩过 1 已经赞/踩过 
         * type: 0 赞/取消赞 1 踩/取消踩
         */
        vote_content(index, type) {
            let content = this.contents[index]
            let vtype = 0
            voted = content.upvote[1] + content.downvote[1]
            if (type == 0 && content.upvote[1] == 0) {
                // 点赞
                vtype = 1
            }
            else if (type == 1 && content.downvote[1] == 0) {
                vtype = 2
            }
            else {
                vtype = 4
            }
            let that = this
            let next = {
                then(res) {
                    if (res.msg == "ok" && res.data.dbmsg == "ok") {
                        if (vtype == 1) {
                            content.downvote[0] -= content.downvote[1]
                            content.downvote[1] = 0
                            content.upvote[1] = 1
                            content.upvote[0] += 1
                        }
                        else if (vtype == 2) {
                            content.upvote[0] -= content.upvote[1]
                            content.upvote[1] = 0
                            content.downvote[1] = 1
                            content.downvote[0] += 1
                        }
                        else {
                            content.upvote[0] -= content.upvote[1]
                            content.downvote[0] -= content.downvote[1]
                            content.upvote[1] = 0
                            content.downvote[1] = 0
                        }
                        console.log(content)
                        Vue.set(that.contents, index, content)
                    }
                    else {
                        console.log("Server error while vote contet:", res)
                    }
                },
                catch(err) {
                    console.log("Network error while vote content:", err)
                }
            }
            client.vote_content(content.cid, vtype, 0, next)
        },
        try_reward_content(content) {
            this.reward.floor = content.floor
            this.reward.cid = content.cid
            this.reward.author = content.author
            $('#reward-modal').modal('show')
        },
        select_amount(amount) {
            this.reward.amount = amount.toString()
        },
        reward_content() {
            let that = this
            let content = that.contents[that.reward.floor - 1]
            let next = {
                then(res) {
                    if (res.msg == "ok") {
                        if (res.data.dbmsg == "ok") {
                            alert("打赏成功！")
                            $('#reward-modal').modal('hide')
                            content.reward[0] += Number(that.reward.amount)
                            content.reward[1] += Number(that.reward.amount)
                            Vue.set(that.contents, that.reward.floor - 1, content)
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
            client.vote_content(this.reward.cid, 3, Number(this.reward.amount), next)
        },
        load_more() {
            let start = this.content_end
            let end = this.content_end + 20
            let that = this
            let next = {
                then(res) {
                    if (res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if (res.data.dbmsg != "ok") {
                        alert(dbmsgs[res.data.dbmsg])
                    }
                    else {
                        if(res.data.data.length == 0) {
                            alert("没有更多内容啦！")
                            return
                        }
                        that.contents = that.contents.concat(res.data.data)
                        console.log(that)
                        that.content_end += res.data.data.length
                        if(that.content_end - that.content_start > 100) {
                            that.content_start += 50
                        }
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.get_notebook_contents(this.info.id[0], start, end, next)
        },
        load_less() {
            if(that.content_end - that.content_Start > 100) {
                that.content_end += 50
            }   
        }
    }
})
notebook.get_notebook()