export function define_users_page(QEWD) {

  let component = {
    componentName: 'ptwq-content-page',
    state: {
      name: 'users',
      crud_params: {
        title: 'Users'
      }
    },
    hooks: ['use_crud_page']
  };

  let hooks = {
    'ptwq-content-page': {
      use_crud_page: function(_state) {
        let assembly = {
          componentName: 'adminui-crud',
          state: _state.crud_params
        }
      }
    }
  };

  return {component, hooks};
};

