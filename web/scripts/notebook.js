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
        content_end: 20
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
            this.contents = client.get_notebook_contents(nid, this.content_start, this.content_end,
                {
                    then(res) {
                        if (res.msg != "ok") {
                            alert(smsgs[res.msg])
                        }
                        else if (res.data.dbmsg != "ok") {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                        else {
                            that.contents = res.data.data
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
            else if(type==1 && content.downvote[1] == 0) {
                vtype = 2
            }
            else{
                vtype = 4
            }
            let that = this
            let next = {
                then(res){
                    if(res.msg == "ok" && res.data.dbmsg == "ok") {
                        if(vtype == 1){
                            content.downvote[0] -= content.downvote[1]
                            content.downvote[1] = 0
                            content.upvote[1] = 1
                            content.upvote[0] += 1
                        }
                        else if(vtype == 2){
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
        }
    }
})
notebook.get_notebook()