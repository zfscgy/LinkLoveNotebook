var notebook = new Vue({
    el: "#notebook",
    data: {
        info:{
            name:"",
            author:{
                name:"",
                avatar:""
            }
        },
        contents:[]

    },
    methods:{
        get_notebook(){
            let params  = window.location.search.substring(1).split('&')
            let para_dict = new Array()
            for(var i in params){
                let p = params[i].split('=')
                para_dict[p[0]] = p[1]
            }
            let id = para_dict["id"]
            let that = this
            let next = {
                then(res) {
                    if(res.msg != "ok") {
                        alert(smsgs[res.msg])
                    }
                    else if(res.data.info.dbmsg != "ok"){
                        alert(dbmsgs[res.data.info.dbmsg])
                    }
                    else
                    {
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
        }
    }
})
notebook.get_notebook()