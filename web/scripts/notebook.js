var notebook = new Vue({
    el: "#notebook",
    data: {
        info: {
            id: ["",-1],
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
                        console.log(this.info, this.contents)
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
            let nid = this.info.id[0]
            let that = this
            this.contents = client.get_notebook_contents(nid, this.content_start, this.content_end, 
                {
                    then(res){
                        if(res.msg!="ok"){
                            alert(smsgs[res.msg])
                        }
                        else if(res.data.dbmsg!="ok") {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                        else {
                            that.contents = res
                        }
                    },
                    catch(err){
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
        }
    }
})
notebook.get_notebook()