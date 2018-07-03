//index.js
//获取应用实例
const app = getApp()
const hostUrl = app.globalData.hostUrl;
const util = require('../../utils/util.js');
const WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    category: [{
        name: '首页',
        id: 'home'
      },
      {
        name: '分类',
        id: 'type'
      },
      {
        name: '留言',
        id: 'message'
      },
      {
        name: '关于',
        id: 'about'
      }
    ],
    curIndex: 0,
    curId: 'home',
    curPage: 1, //当前页数
    articleList: [],
    firstPage: false,
    lastPage: false,
    articleDetail: {}, //文章详情内容
    authorList: [],
    categories: [],
    cateId: null,
    msName: '',
    msEmail: '',
    msWebsite: '',
    msCont: '',
    returnHome: '<返回',
    noGoBack: false,
    messageList: [], //留言列表
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() {
    this.getData('home');
    this.getAuthorList();
    this.getCategories();
    // this.testClick();
  },
  /**
   * 点击底部菜单切换
   */
  switchTab(e) {
    let index = e.target.dataset.index;
    let curId = this.data.category[index].id;
    this.setData({
      "curIndex": index,
      "curId": curId,
      "noGoBack": false
    })
    switch (curId) {
      case 'home':
        this.setData({
          "cateId": null
        })
        this.getData('home');
        break;
      case 'type':
        this.setData({
          'curPage': 1
        });
        break;
      case 'about':
        this.showAbout();
        break;
      case 'message':
        this.getMessageList();
        break;
      default:
        break;
    }
  },
  //获取作者列表
  getAuthorList: function() {
    let url = hostUrl + '/Users';
    wx.request({
      url: url,
      method: 'GET',
      success: (data) => {
        if (data.statusCode === 200) {
          this.setData({
            'authorList': data.data
          })
        }
      }
    })
  },
  //获取分类列表
  getCategories: function() {
    let url = hostUrl + '/Categories';
    wx.request({
      url: url,
      method: 'GET',
      success: (data) => {
        // console.log(data)
        if (data.statusCode === 200) {
          this.setData({
            'categories': data.data
          })
        }
      }
    })
  },
  /**
   * 获取数据
   */
  getData(type) {
    if (type === 'home') {
      let url = hostUrl + '/posts?page=' + this.data.curPage;
      let cateId = this.data.cateId;
      if (cateId) {
        url += '&categories=' + cateId;
      }
      // console.log(url)
      wx.request({
        url: url,
        method: 'GET',
        success: (data) => {
          // console.log('=====', data);
          if (data.statusCode === 200) {
            if (data && data.data.length > 0) {
              // this.data.articleList = data.data;
              let resData = data.data;
              let arr = [];
              for (var item of resData) {
                item.date = util.formatTime(new Date(item.date));
                arr.push(item);
              }
              let lastPage = false;
              let firstPage = false;
              if (arr.length < 10) {
                lastPage = true;
              }
              if (this.data.curPage === 1) {
                firstPage = true;
              }
              this.setData({
                "articleList": arr,
                "lastPage": lastPage,
                "firstPage": firstPage
              })
              if (cateId) {
                this.setData({
                  'curId': 'home'
                })
              }
            }
          } else {
            this.setData({
              "articleList": [],
              "lastPage": true,
              "firstPage": false
            })
          }
        }
      })
    }
  },
  /**
   * 进行翻页
   */
  changePage: function(e) {
    var id = e.target.dataset.id;
    var num = this.data.curPage;
    switch (id) {
      case 'down':
        num++;
        break;
      case 'up':
        num > 1 ? num-- : num = 1;
        break;
      default:
        break;
    }
    this.setData({
      "curPage": num
    })
    this.getData('home');
  },
  /**
   * 打开文章详情
   */
  openPage: function(e) {
    // let id = e.target.dataset.id;
    let cont = e.target.dataset.cont;
    let authorId = cont.author;
    let cateIds = cont.categories;
    for (var item of this.data.authorList) {
      if (authorId === item.id) {
        cont.authorName = item.name;
      }
    }
    let cateName = '暂无分类';
    // console.log(this.data.categories)
    if (cateIds && cateIds.length > 0) {
      cateName = '';
      for (var i = 0; i < cateIds.length; i++) {
        let item = cateIds[i];
        for (var _item of this.data.categories) {
          if (item === _item.id) {
            cateName += _item.name
          }
        }
        if (i != cateIds.length - 1) {
          cateName += ',';
        }
      }
    }
    let that = this;
    // console.log(cont.content.rendered)
    WxParse.wxParse('article', 'html', cont.content.rendered, that, 5);
    cont.cateName = cateName;
    this.setData({
      'articleDetail': cont,
      'curId': 'showDetail'
    })
  },
  //详情页点击返回
  goBack: function(e) {
    this.setData({
      'curId': 'home'
    })
  },
  //点击分类的按钮，进入文章检索
  getTypePage: function(e) {
    console.log(e)
    let id = e.target.dataset.id;
    this.setData({
      "cateId": id
    })
    this.getData('home');
  },
  //点击关于按钮
  showAbout: function() {
    let url = hostUrl + '/pages/208';
    wx.request({
      url: url,
      method: 'GET',
      success: (data) => {
        // console.log(11111, data);
        this.setData({
          "curId": 'showDetail',
          "noGoBack": true
        })
        data.data.date = util.formatTime(new Date(data.data.date));
        var cont = {
          target: {
            dataset: {
              cont: data.data
            }
          }
        };
        this.openPage(cont);
      }
    })
  },
  //留言输入内容改变时
  bindKeyInput: function(e) {
    let type = e.currentTarget.dataset.id;
    let cont = e.detail.value;
    switch (type) {
      case 'name':
        this.setData({
          'msName': cont
        })
        break;
      case 'email':
        this.setData({
          'msEmail': cont
        })
        break;
      case 'website':
        this.setData({
          'msWebsite': cont
        })
        break;
      case 'cont':
        this.setData({
          'msCont': cont
        })
        break;
      default:
        break;
    }
  },
  //获取留言板列表
  getMessageList: function(id) {
    if (id === undefined || id === '') {
      id = 66;
    }
    let that = this;
    let url = hostUrl + '/comments?post=' + id;
    wx.request({
      url: url,
      method: 'GET',
      success: (data) => {
        // console.log(data)
        if (data.statusCode === 200) {
          let arr = [];
          let msgArr = data.data;
          for (let i = 0; i < msgArr.length; i++) {
            let date = util.formatTime(new Date(msgArr[i].date));
            let temp = "<div class='msg-title'><span class='msg-author'>" + msgArr[i].author_name + "</span> 说:" + msgArr[i].content.rendered + "</div><div class='list-time'>" + date + "</div>";
            WxParse.wxParse('message' + i, 'html', temp, that);
            if (i === msgArr.length - 1) {
              WxParse.wxParseTemArray("msgArray", 'message', msgArr.length, that)
            }
          }
        }
      }
    });
  },
  //保存留言
  saveComment: function(e) {
    // console.log(e)
    // console.log(this.data.msName, this.data.msEmail, this.data.msWebsite, this.data.msCont)
    if (this.data.msName === '' || this.data.msCont === '') {
      return wx.showToast({
        title: '请输入完整内容',
        icon: 'none'
      });
    }
    let obj = {
      "post": 66,
      "author_name": this.data.msName,
      "author_email": this.data.msEmail,
      "author_url": this.data.msWebsite,
      "content": this.data.msCont
    }
    let url = hostUrl + '/comments';
    // console.log(obj)
    wx.request({
      url: url,
      method: 'POST',
      data: obj,
      success: (data) => {
        console.log(data)
        if (data.statusCode === 201) {
          wx.showToast({
            title: '感谢您的留言',
            icon: 'none'
          });
          this.setData({
            "msCont": ''
          })
        } else {
          wx.showToast({
            title: data.data.message,
            icon: 'none'
          });
        }

        this.getMessageList();
      },
      fail: function(err) {
        wx.showToast({
          title: '留言失败，请重试！',
          icon: 'none'
        });
        this.getMessageList();
      }
    });
  }
})