export function define_topbar(QEWD) {

  //          **** topbar ****

  let component = [
    {
      componentName: 'adminui-topbar-toggler'
    },

    {
      componentName: 'adminui-topbar-navbar',
      children: [
        {
          componentName: 'adminui-topbar-text',
          state: {
            text: 'My Application',
            colour: 'warning',
            name: 'header-text',
          },
          hooks: ['updateTopBar1']
        },
      ]
    }
  ];

  let hooks = {
    'adminui-topbar-search': {
      search: function() {
        let _this = this;
        let fn = function() {
          QEWD.send({
            type: 'search',
            value: _this.searchField.value
          }, function(responseObj) {
            console.log(responseObj);
          });
        };
        this.addHandler(fn, this.searchBtn);
      }
    },
    'adminui-topbar-navbar-dropdown': {
      getMessages: function() {
        let _this = this;
        let fn = function(responseObj) {
          _this.handleItemsUpdate(responseObj.message);
        };
        QEWD.on('getDropdownItems', fn);
        this.onUnload = function() {
          QEWD.off('getDropdownItems', fn);
        }
        QEWD.send({
          type: 'getDropdownItems',
          ref: _this.ref
        });
      }
    },
    'adminui-topbar-navbar-menu': {
      getOptions: function() {
        let _this = this;
        var fn = function(responseObj) {
          _this.handleItemsUpdate(responseObj.message);
        };
        QEWD.on('getMenuItems', fn);
        this.onUnload = function() {
          QEWD.off('getMenuItems', fn);
        }
        QEWD.send({
          type: 'getMenuItems',
          ref: _this.ref
        });
      }
    },
    'adminui-topbar-navbar-menu-item': {
      getMenuDetail: function(state) {
        let _this = this;
        let fn = function() {
          QEWD.send({
            type: 'getMenuDetail',
            ref: state.ref,
            itemId: state.itemId
          }, function(responseObj) {
          });
        };
        this.addHandler(fn, this.aTag);
      }
    },
    'adminui-topbar-text': {
      updateTopBar1: function(state) {
        let _this = this;
        let fn = function() {
        //  QEWD.send({
         //   type: 'getMenuDetail',
         //   ref: state.ref,
         //   itemId: state.itemId
         // }, function(responseObj) {
         // });
         console.log("In top bar hook");
         let div = _this.getComponentByName('adminui-topbar-text');
         //div.setState({text: 'added by event - from click from ' + cell.data()});
         QEWD.send({
          type: 'getSetPatientID',
          msg: "Please set it"
        }, function(responseObj) {
          console.log("response is " + JSON.stringify(responseObj));
          if (responseObj.message.ptback){
          console.log("email is " + responseObj.message.ptback.email);
          div.setState({text: 'Pt-email : ' +  responseObj.message.ptback.email});
          }
        });

         //div.setState({text: 'Clicked the AppBar'});



        };

        this.addHandler(fn, this.aTag);
      }
    }
  };

  return {component, hooks};
};
