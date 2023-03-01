import {Component, Injector} from '@angular/core';
import {IspBaseComponent, SpinnerService} from '@isp/xdce-arch-core';
import { ALL_FUNCS, ALL_MODELS } from '@isp/xdce-module-wimtwidget-v1';
import { NbpSize, NbpStyle } from '@isp/xdce-widget';
import { Subject } from 'rxjs';
import { tableConfigurationSecondDrillDown } from '../../../utils/configuration-const';
import {  colorsChart, dataTableSeconDrillDown, mockupDataRomo, mockupDataRomoFirstDrillDownMessage,mockupDataRomoFirstDrillDownOperation,mockupDataRomoFirstDrillDownTerminate,  secondaryFiltersRomoPie, tableValueOperation } from '../../../utils/data-mock';
import { generateTooltipText,getChartOpts,  getChartOptsPie,  setConfigurations } from '../../../utils/shared-functions';

@Component({
    selector: 'romo-pie',
    templateUrl: './romopie-component.html',
    styleUrls: ['./romopie-component.scss']
})
export class RomoPieHomeComponent extends IspBaseComponent {
    firstDrillDownFilter: any[];

constructor(injector: Injector , private spinnerService: SpinnerService  ) {
    super(injector);
    
}
tableValue= [];
timestamp: string;
timestampFirstDrillDown : string;
timestampSecondDrillDown : string;
chartConfiguration = [];
chartConfigurationFirstDrillDown = [];
secondaryFilters: ALL_MODELS.Filter[] = [];
platform = null;
platformFirstDrillDownGreen = null;
platformFirstDrillDown = null;
tooltips = [];
mainData = [];
labels = [];
colors = colorsChart;
showDrilldown : boolean = false;
showDrilldownSecondLevel: boolean = false;
labelsFirstDrillDown = [];
tooltipsFirstDrillDown = [];
mainDataFirstDrillDown = [];
waiting = true;
isResetting = false;
lastUpdates = [];
secondDrillDownData = [];
secondDrillDownDataTotalRecords = null;
secondDrilldownRowNumber = 10;
_nbpStyle = NbpStyle;
_nbpSize = NbpSize;
tableLegendOperation = tableValueOperation
valueSecondDrillDown = dataTableSeconDrillDown;
configurationTableSecondDrillDown = tableConfigurationSecondDrillDown;
drilldownEvt: Subject<ALL_MODELS.SimpleEvt> = new Subject<ALL_MODELS.SimpleEvt>();
autoRefresh:any = [{key: 15, label: '15 secondi'}, {key: 30, label: '30 secondi'}, {key: 60, label: '60 secondi'}, {key: 120, label: '120 secondi'}];
auths:string[] = [];
legend = []
table = null;


ispOnInit(): void {
    for(let auth of this.profileManager.getAllAuths()) {
        this.auths.push(auth.name);
    }
    this.secondaryFilters = JSON.parse(JSON.stringify(secondaryFiltersRomoPie));
    setTimeout(()=> {
        this.getRomopie()
    },1000)
}

getRomopie(){
    this.platform = [];
    let platformRed =  mockupDataRomo.data.find(el => el.item == "MessaggiBloccati")
    let platformOrange = mockupDataRomo.data.find(el => el.item == "OperazioniBloccate")
    let platformGreem = mockupDataRomo.data.find(el => el.item == "Terminate")
    this.timestamp = mockupDataRomo.timestamp
    this.lastUpdates = tableValueOperation.data
    this.platform.push(platformRed, platformOrange, platformGreem)
    this.autoRefresh = true;
    this.getChart();
}

refresh() {
    if(!this.waiting) {
      this.waiting = true;
      setTimeout (() => {
        this.waiting = false;
        this.getRomopie();
      }, 1000);
    }
  }

getChart(){
    this.labels = [];
    this.mainData = [];
    this.tooltips = [];
    let colors = [];
    let maxValue = 3;
    this.platform.forEach(element => {
      let translateFilterReason = this.translate.instant(element.item);
        this.tooltips[translateFilterReason] = [];
        this.labels.push(translateFilterReason);
        let translatedPlatform = this.translate.instant(element.item);
        let mainDataIndex = this.mainData.findIndex(function (value) {
            return value.label == translatedPlatform;
        });
        if(mainDataIndex != -1) {
            this.mainData[mainDataIndex].data.push(element.item);
        }else {
        colors.push(this.colors[element.item])
        this.mainData.push({label: element.item, data: element.num, backgroundColor : colors})
        this.tooltips.push(generateTooltipText(this.colors[element.item], element.item, element.num))
      }
      });
      this.chartConfiguration = setConfigurations('pie',
        this.labels, getChartOptsPie(this.tooltips, true), colors);
  }


getFirstDrillDown(element){
  if(element && element[0]) {
    this.platformFirstDrillDown = [];
    let elementSource = this.platform[element[0]._index];
    let platformValue = elementSource.item;
    if(platformValue == mockupDataRomo.data[2].item){
      mockupDataRomoFirstDrillDownTerminate.data.forEach(el => {
        this.platformFirstDrillDown.push({label: el.label , data: el.num})
        this.table = this.tableLegendOperation.data1
        document.getElementById("table").style.borderColor = "green";
      })
      this.timestampFirstDrillDown = mockupDataRomoFirstDrillDownTerminate.timestamp
    }if(platformValue == mockupDataRomo.data[1].item){
      mockupDataRomoFirstDrillDownOperation.data1.forEach(el => {
        this.platformFirstDrillDown.push({label: el.label , data: el.num})
        this.table = this.tableLegendOperation.data
        document.getElementById("table").style.borderColor = "orange";
      })
    }
    if(platformValue == mockupDataRomo.data[0].item){
      mockupDataRomoFirstDrillDownMessage.data.forEach(el => {
        this.platformFirstDrillDown.push({label: el.label , data: el.num})
        this.table = this.tableLegendOperation.data2
        document.getElementById("table").style.borderColor = "red";
      })
    }
    this.getChartFirstDrillDown(platformValue);
  }else {
   this.isResetting = true
  }
  this.showDrilldown = true;
}
getChartFirstDrillDown(platform){
    this.mainDataFirstDrillDown = [];
    this.labelsFirstDrillDown = [];
    this.tooltipsFirstDrillDown= [];
    let firstDrllDowncolors = [];
    let platformColor = this.colors[platform]
    let maxValue = 3;
    this.platformFirstDrillDown.forEach((element,index) => {
      this.tooltipsFirstDrillDown[element.label] = [];
      this.labelsFirstDrillDown.push(element.label);
      let valueNumber = [];
      while(valueNumber.length < index) {
        valueNumber.push(0);
      }
      valueNumber.push(element.data);
        this.mainDataFirstDrillDown[index] = {data:valueNumber, label: element.label};
        firstDrllDowncolors.push({backgroundColor:platformColor});
        maxValue = element.num > maxValue? element.num: maxValue;
    })
      this.chartConfigurationFirstDrillDown = setConfigurations('bar',
      this.labelsFirstDrillDown, getChartOpts(this.tooltipsFirstDrillDown, true, true, maxValue), firstDrllDowncolors);
     
}


getSecondDrillDownData(){
  this.showDrilldownSecondLevel = true
  for (let item of this.valueSecondDrillDown.data) {
    for (let property of this.configurationTableSecondDrillDown) {
      if (item[property.key] == "" || item[property.key] == null || item[property.key] == undefined) {
        item[property.key] = " ";
      }
    }
    this.timestampSecondDrillDown = this.valueSecondDrillDown.timestamp
    this.secondDrillDownData = this.valueSecondDrillDown.data
    this.secondDrillDownDataTotalRecords = this.valueSecondDrillDown.numresult
    this.drilldownEvt.next(new ALL_MODELS.SimpleEvt('DATAREFRESHED', ''));
    this.spinnerService.hideAll();
  }
}

wimtEvt(event:ALL_MODELS.SimpleEvt | any) {
    switch (event.action.toUpperCase()) {
      case 'REFRESH':
        this.refresh();
        break;
      case 'SUB__REFRESH':
        this.getFirstDrillDown({});
        break;
      case 'CHART_DETAIL':
        this.getFirstDrillDown(event.el);
        break;
      //case 'DD__REFRESH':
      case 'SUB__CHART_DETAIL':
      case 'DD__GET_DRILLDOWN_DATA':
        this.getSecondDrillDownData();
        break;
        //this.getSecondDrilldownData(event.el);
        break;
    }
  }



















}
