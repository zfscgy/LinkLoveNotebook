var account = new Vue({
    el:"#account",
    data:{
        name: "Steven",
        avatar: "res/imgs/img1.jpg",
        friends: [{name: "Cwk", avatar:"res/imgs/img1.jpg"}],
        notebooks:[
            {name:"My first blockchain notebook", desc:"hello world!", link:"my_notebook_zfscgy"},
            {name:"My diary", desc:"Record my life...", link:"zfscgy_diary"}],
        current_page: 1,
        notebooks_perpage: 10
    }
})