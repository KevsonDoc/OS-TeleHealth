import {patientsPageState} from '../patients_page_state.js'
import {crud_assembly} from '../../../components/adminui-custom/components/adminui-crud-custom.js';
import {cSchemaLookup} from "../utils/cSchemaLookup.js";

let patients_extended = {
    ...patientsPageState,

}

function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

export function patients_extended_crud(QEWD) {
    let {component, hooks} = crud_assembly(QEWD, patients_extended);
    let state = patients_extended;
    state.patientIdDepends = false;
    var activePatient = 0;
    let extendedHooks = {
        'adminui-datatables': {
            patientDatatableExtendHook: function () {
                let table = this.table;
                let context = this.context;
                let _this = this;
                /**
                 * Reset state of the layout when we open patients list again
                 * @type {Element}
                 */
                var root = document.getElementsByTagName('ptwq-root')[0];

                root.sidebarTarget.classList.add('d-none');
                context.selectedPatient = null;

                let component = _this.getComponentByName('ptwq-topheader', 'top-header-patient');

                component.setState({
                    patient: null
                });

                if (
                    _this.context.user
                    &&
                    _this.context.user.role
                    &&
                    context.user.role === 'patient'
                ) {
                    root.loaderVisibility(true);

                    console.log('role is set');
                    QEWD.reply({
                        type: state.summary.qewd.getDetail,
                        params: {
                            id: '1',
                        }
                    }).then((res) => {

                        let obj = res.message.record;
                        context.selectedPatient = obj;

                        let component = _this.getComponentByName('ptwq-topheader', 'top-header-patient');

                        component.setState({
                            patient: obj
                        });

                        var root = document.getElementsByTagName('ptwq-root')[0];
                        root.sidebarTarget.classList.remove('d-none');
                        root.loaderVisibility(false);

                        root.switchToPage('psummary');

                    });
                }

                $(table).on('draw.dt', () => {
                    // console.log('sdfsdf');

                    $(document).on('click', 'adminui-button', function () {
                        let id_str = this.parentNode.id;
                        let component = _this.getComponentByName('ptwq-topheader', 'top-header-patient');


                        if (id_str && id_str.includes('patients-record-')) {
                            let id = this.parentNode.id.split('record-')[1];
                            activePatient = id;
                        }
                    })
                });
            }
        },
    }

    let adminui_row = cSchemaLookup(component, 'adminui-row');
    let datatable = adminui_row.children[0].children[1].children[0];

    let patientBlock = cSchemaLookup(
        component,
        'adminui-content-card-body',
        state.name + '-details-card-body'
    );


    patientBlock.children.push({
        componentName: 'adminui-button',
        state: {
            text: 'Select Patient',
        },
        hooks: ['selectPatientBlock']
    });
    console.log(patientBlock);

    let patientsDetails =

    datatable.hooks.push('patientDatatableExtendHook');

    hooks['adminui-button'].selectPatientBlock = function () {

        let _this = this;
        let context = this.context;

        $(this.rootElement).click(function () {
            let component = _this.getComponentByName('ptwq-topheader', 'top-header-patient');
            QEWD.reply({
                type: state.summary.qewd.getDetail,
                params: {
                    id: activePatient
                }
            }).then((res) => {
                let obj = res.message.record;

                component.setState({
                    patient: obj
                });

                context.selectedPatient = obj;

                var root = document.getElementsByTagName('ptwq-root')[0];
                root.sidebarTarget.classList.remove('d-none');

                root.switchToPage('psummary');
            }).catch((err) => {

            });

        });
    }

    //Merge whole data block
    hooks = mergeDeep(hooks, extendedHooks);
    console.log(hooks);
    return {component, hooks};
}
