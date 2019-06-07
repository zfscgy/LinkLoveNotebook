let login = new Vue({
    el: "#login",
    data: {
        selected: "login-tab"
    },
    methods: {
        switch_tab(event) {
            console.log("Switch tab to " + event.currentTarget.id)
            this.selected = event.currentTarget.id
        }
    }
})