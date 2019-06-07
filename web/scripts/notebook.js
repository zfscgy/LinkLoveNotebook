var notebook = new Vue({
    el: "#notebook",
    data: {
        name: "My love diary",
        authors: [{ name: "David", avatar: "res/imgs/img1.jpg" },
        { name: "Cwk", avatar: "res/imgs/img2.jpg" }],
        contents: [{
            date: '2019-01-01 12:00:00',
            author: { name: "David", avatar: "res/imgs/img1.jpg" },
            text: "今天我开启了这个笔记本，哈哈哈",
            pics: []
        },
        {
            date: '2019-06-01 12:00:00',
            author: { name: "Cwk", avatar: "res/imgs/img2.jpg" },
            text: "按照科大现在的体量，是没办法做到大而全的。科大几乎只有理科，工科也算不得强，但是理科在全国乃至世界都是得到认可的。这也是科大最大的特色。人才培养和科研成果几乎都集中在理科，少部分在工科，其他领域几乎为0。",
            pics: []
        }]
    }

})