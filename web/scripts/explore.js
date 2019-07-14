let explore = new Vue({
    el:"#explore",
    data:{
        account_info:{
            avatar:"",
        },
        newest_notebooks: [],
        cur_page: 0,
        notebooks_per_page: 30
    },
    methods:{
        get_recent_notebooks: function() {
            let that = this
            let next = {
                 then(res) {
                     if(res.msg == "ok") {
                         if(res.data.dbmsg == "ok") {
                             that.newest_notebooks =  res.data.data
                         }
                         else {
                             alert(dbmsgs[res.data.dbmsg])
                         }
                     }
                     else {
                         alert(smsgs[res.data.smsg])
                     }
                 },
                 catch(err) {
                     console.log(err)
                     alert(err)
                 }
            }
            client.get_recent_notebooks(this.cur_page * this.notebooks_per_page, 
                (this.cur_page + 1) * this.notebooks_per_page, next)
        },
        set_page: function(page) {
            let that = this
            let next = {
                then(res) {
                    if(res.msg == "ok") {
                        if(res.data.dbmsg == "ok") {
                            let notebooks = res.data.data
                            if(notebooks.length == 0) {
                                alert("已经没有更多内容啦！")
                            }
                            else {
                                that.newest_notebooks =  notebooks
                                this.cur_page = page - 1
                            }
                        }
                        else {
                            alert(dbmsgs[res.data.dbmsg])
                        }
                    }
                    else {
                        alert(smsgs[res.data.smsg])
                    }
                },
                catch(err) {
                    console.log(err)
                    alert(err)
                }
            }
            client.get_recent_notebooks((page - 1) * this.notebooks_per_page, 
                page * this.notebooks_per_page, next)
        }
    }
})
explore.get_recent_notebooks()