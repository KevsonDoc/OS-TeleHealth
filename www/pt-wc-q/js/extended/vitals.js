import {vitalsPageState} from '../vitals_page_state.js'
import {crud_assembly} from '../../../components/adminui-custom/components/adminui-crud-custom.js';
import {cSchemaLookup} from "../utils/cSchemaLookup.js";

let vitals_exteneded = {
    ...vitalsPageState,

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

export function vitals_extended_crud(QEWD) {
    let {component, hooks} = crud_assembly(QEWD, vitals_exteneded);
    let state = vitals_exteneded;
    component.hooks.push('addButton');


    let extendedHooks = {
        'ptwq-content-page': {
            addButton: function () {
                $(document).on('init.dt', () => {

                    let card = this.getComponentByName('adminui-content-card', state.name + '-chart-card');
                    let card2 = this.getComponentByName('adminui-content-card', state.name + '-summary-card');
                    console.log('there');
                    console.log(card2);
                    card.setState({
                        cls: 'd-none'
                    });

                    let table = this.getComponentByName('adminui-datatables', state.name);
                    console.log('table');
                    console.log(table);
                    if(! $(table).find('.this-show-button').length) {

                        let button = document.createElement('button');
                        $(button).text('Show Chart');
                        $(button).addClass('this-show-button');
                        $(button).click(() => {
                            console.log('there');
                            card.rootElement.classList.add('d-none');
                            card.rootElement.classList.remove('d-flex');

                            card2.rootElement.classList.add('d-none');
                            card2.rootElement.classList.remove('d-block');

                        });
                        $(table).append(button);
                    }
                });
                //  let body = this.getParentComponent('adminui-content-card-body');
            }
        },
        'adminui-chart': {
            getChartData: function () {
                let context = this.context;
                console.log('charts init');
                QEWD.reply({
                    type: state.summary.qewd.getSummary,
                    params: {
                        proprties: ['heartrate', 'resprate', 'systolic_bp', 'score','patient_id']
                    }
                })
                    .then((responseObj) => {
                        console.log(responseObj);

                        let data =[] ;
                        let heartrate = [], resprate = [], systolic_rate = [];

                        responseObj.message.summary.forEach(function(record) {
                            if (context.selectedPatient && state.patientIdDepends) {
                                if (context.selectedPatient.id !== record.patient_id) {
                                    return true; // SKIP BY FILTER
                                }
                            }
                            data.push(record);
                        });

                        let result = data.forEach(el => {
                            heartrate.push({
                                x: el.id,
                                y: el.heartrate,
                            })
                            resprate.push({
                                x: el.id,
                                y: el.resprate,
                            })
                            systolic_rate.push({
                                x: el.id,
                                y: el.systolic_bp,
                            })
                        });
                        let config = {
                            type: 'scatter',
                            data: {
                                datasets: [{
                                    label: 'Heart Rate',
                                    backgroundColor: 'rgba(226,57,57,0.5)',
                                    borderColor: '#e23939',
                                    fill: false,
                                    showLine: true,

                                    data: heartrate,
                                }, {
                                    label: 'Resp Rate',
                                    backgroundColor: 'rgba(57,171,226,0.5)',
                                    borderColor: '#39abe2',
                                    fill: false,
                                    showLine: true,

                                    data: resprate,
                                }, {
                                    label: 'Systolic Rate',
                                    backgroundColor: 'rgba(226,57,220,0.5)',
                                    borderColor: '#e239dc',
                                    fill: false,
                                    showLine: true,

                                    data: systolic_rate,
                                }],
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false

                                },
                            }
                        };
                        this.canvas.height = '500px';
                        this.draw(config);

                    });

                let card = this.getComponentByName('adminui-content-card', state.name + '-chart-card');

            }
        },

        'adminui-content-card-button-title': {

            showVitals: function () {
                let _this = this;
                console.log('there4');
                let fn = function () {
                    console.log('there5');

                    let card = _this.getComponentByName('adminui-content-card', state.name + '-chart-card');
                    let card2 = _this.getComponentByName('adminui-content-card', state.name + '-summary-card');
                    card.setState({
                        cls: 'd-none',
                    });

                    card.rootElement.classList.remove('d-block');
                    card2.rootElement.classList.add('d-none');


                }
                this.addHandler(fn);
            },
        }
    };
    let vitalsGraph = {
        componentName: 'adminui-content-card',
        state: {
            name: state.name + '-chart-card'
        },
        children: [
            {
                componentName: 'adminui-content-card-header',
                children: [
                    {
                        componentName: 'adminui-content-card-button-title',
                        state: {
                            title: 'Chart data',
                            title_colour: state.summary.titleColour,
                            icon: 'table',
                            buttonColour: state.summary.btnColour,
                            tooltip: 'Show CRUD',
                            hideButton: false
                        },
                        hooks: ['showVitals']
                    }
                ]
            },
            {
                componentName: 'adminui-content-card-body',
                children: [
                    {
                        componentName: 'adminui-chart',
                        hooks: ['getChartData']
                    }
                ]
            }
        ]
    };
    let adminui_row = cSchemaLookup(component,'adminui-row');
    adminui_row.children.unshift(vitalsGraph);

    console.log('there123');
    console.log(component);
    let extendedComponent = {

    };

    //Merge whole data block
    component = mergeDeep(component, extendedComponent);
    hooks = mergeDeep(hooks, extendedHooks);
    console.log(hooks);
    return {component, hooks};
}
