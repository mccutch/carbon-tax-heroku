import React from 'react';
import * as units from './unitConversions.js';
import {findFuel} from './fuelTypes.js';
import {VehicleSaveForm} from './vehicleSave.js';




class ListInput extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      list: [],
    }
  }

  fetchList(){
    let returnList = [this.props.defaultText]
    if(this.props.suffix){
      
      console.log("Searching "+this.props.url+this.props.suffix);
      fetch(this.props.url+this.props.suffix)
      .then(res => res.text())
      .then(
        (result) => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(result, "text/xml");
            let x = xmlDoc.getElementsByTagName("text");
            for (let i = 0; i< x.length; i++) {
              returnList.push((x[i].childNodes[0].nodeValue));
            }
            this.setState({list: returnList});
            if (returnList.length === 1){
              console.log("LIST LENGTH =1 ")
            }
        },
        (error) => {
            console.log("Error");
        }
      ) 
    } else {
      this.setState({list: returnList});
    }
  }

  
  componentDidMount(){
    this.fetchList();
  }
  
  
  componentDidUpdate(prevProps){
    if(prevProps.suffix !== this.props.suffix){
      console.log('Suffix changed')
      this.fetchList();
    }
  }
  

  renderOptions() {
      let list = this.state.list;
      let listOptions = [];
      for(let i=0; i<list.length; i++){
        listOptions.push(<option 
                            value={list[i]}
                            key = {list[i]}
                          >
                          {list[i]}</option>)
      }
      return listOptions;
  }

  render(){

    return(
          <select
            onChange = {this.props.onChange}
            name = {this.props.label}
          >
            {this.renderOptions()}
          </select>
    );
  }
}


class VehicleInputFields extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      year: null,
      make: null,
      model: null,
      options: null,
      idFound: false,
    }
    this.handleChange = this.handleChange.bind(this)
    this.yearDefault = "YEAR";
    this.makeDefault = "MAKE";
    this.modelDefault = "MODEL";
    this.optionsDefault = "OPTIONS";
  }

  handleChange(event){

    let newValue = event.target.value;

    if(event.target.name === 'Year'){ 
      if(event.target.value === this.yearDefault){
        newValue = null
      }
      this.setState({ year: newValue,
                      make: null,
                      model: null,
                      options: null,
                      idFound: false,
                    })
      this.props.returnVehicleId(null);
    }
    if(event.target.name === 'Make'){
      if(event.target.value === this.makeDefault){
        newValue = null
      }
      this.setState({ make: newValue,
                      model: null,
                      options: null,
                      idFound: false,
                    })
      this.props.returnVehicleId(null);
    }
    if(event.target.name === 'Model'){
      if(event.target.value === this.modelDefault){
        newValue = null
      }
      this.setState({ model: newValue,
                      options: null,
                      idFound: false,
                    })
      this.props.returnVehicleId(null);
    }
    if(event.target.name === 'Options'){
      if(event.target.value === this.optionsDefault){
        newValue = null
      }
      this.setState({ options: newValue,
                      idFound: false,
                    });
    }
  }


  componentDidUpdate(){
    if(this.state.options && !this.state.idFound){
      this.findVehicleId();
    }
  }

  findVehicleId(){
    console.log("Finding ID");

    let url="https://www.fueleconomy.gov/ws/rest/vehicle/menu/"
    let suffix = "options?year="+this.state.year+"&make="+this.state.make+"&model="+this.state.model

    fetch(url+suffix)
    .then(res => res.text())
    .then(
      (result) => {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(result, "text/xml");
          let x = xmlDoc.getElementsByTagName('text');
          let y = xmlDoc.getElementsByTagName('value');

          for (let i = 0; i< x.length; i++) {
            if((x[i].childNodes[0].nodeValue)===this.state.options){
              this.setState({idFound: true});
              let name = this.state.year+" "+this.state.make+" "+this.state.model;
              this.props.returnVehicleId(name, (y[i].childNodes[0].nodeValue));
            }
          }  
        },
      (error) => {
          console.log("Error");
      }
    ) 
  }


  render(){

    let makeSuffix = ""
    let modelSuffix = ""
    let optionsSuffix = ""

    if (this.state.year){ 
      makeSuffix = "make?year="+this.state.year
    }
    if (this.state.make){
      modelSuffix = "model?year="+this.state.year+"&make="+this.state.make
    }
    if (this.state.model){
      optionsSuffix = "options?year="+this.state.year+"&make="+this.state.make+"&model="+this.state.model
    }

    return(
      <div className="container">
        <div className="container">
          <h2>US Database Vehicle Input</h2>
        </div>
        <div className="container">
          <ListInput  
            label="Year"
            url="https://www.fueleconomy.gov/ws/rest/vehicle/menu/"
            suffix="year"
            type='int'
            onChange={this.handleChange}
            defaultText = {this.yearDefault}
          />
          <ListInput  
            label="Make"
            url="https://www.fueleconomy.gov/ws/rest/vehicle/menu/"
            suffix={makeSuffix}
            type='string'
            onChange={this.handleChange}
            defaultText = {this.makeDefault}
          />
          <ListInput  
            label="Model"
            url="https://www.fueleconomy.gov/ws/rest/vehicle/menu/"
            suffix={modelSuffix}
            type='string'
            onChange={this.handleChange}
            defaultText = {this.modelDefault}
          />
          <ListInput  
            label="Options"
            url="https://www.fueleconomy.gov/ws/rest/vehicle/menu/"
            suffix={optionsSuffix}
            type='options'
            onChange={this.handleChange}
            defaultText = {this.optionsDefault}
          /> 
        </div>
      </div>
    );
  }
}

class SliderInput extends React.Component {
  render(){
    return(
        <label>
          Highway
          <input 
          name="cityProportion"
          type="range" 
          min="0" max="1" 
          value={this.props.initial} 
          onChange={this.props.onChange}
          step={this.props.increment}
          />
          City
        </label>
      );
  } 
}

class VehicleResult extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      cityProportion: 0.55,
      saveAs: this.props.data.name,
    }
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this)
    this.saveAs=this.saveAs.bind(this)
  }

  handleSliderChange(event){
    this.setState({cityProportion: event.target.value})
  }

  handleSubmit(){
    if(this.props.data.vehicleId){
      this.props.submitVehicle(this.findEconomy(), this.props.data.fuelType);
      this.props.saveVehicle()
      this.props.hideForm()
    }
  }

  saveAs(name){
    this.props.saveAs(name, this.findEconomy(), this.props.data.fuelType)
  }
  

  findEconomy(){
    /* return vehicle economy in metric */
    return(
      (this.state.cityProportion * this.props.data.cityLper100Km) 
        + (1-this.state.cityProportion)*this.props.data.highwayLper100Km
    );
  }

  render(){
    let estimatedEconomy = units.convert(this.findEconomy(),this.props.displayUnits);
    let highwayEconomy = units.convert(this.props.data.highwayLper100Km, this.props.displayUnits);
    let cityEconomy = units.convert(this.props.data.cityLper100Km, this.props.displayUnits);
    let unitText = units.displayUnitString(this.props.displayUnits);

    let saveVehicleDisplay
    if(this.props.loggedIn){
      saveVehicleDisplay = <VehicleSaveForm
                            saveAs={this.saveAs}     
                            vehicleName={this.state.saveAs}
                            vehicleWillSave={this.props.vehicleWillSave}
                          />
    }

    return(
      <div>
        <table className="table table-light">
          <thead className="thead-dark">
                <tr><th colSpan="2">{this.props.data.name}</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Highway Economy:</td>
              <td>{parseFloat(highwayEconomy).toFixed(1)} {unitText}</td>
            </tr>
            <tr>
              <td>City Economy:</td>
              <td>{parseFloat(cityEconomy).toFixed(1)} {unitText}</td>
            </tr>
            <tr>
              <td>
                <SliderInput
                  label="Proportion of city driving"
                  name ="cityProportion"
                  start="All city driving"
                  end="All highway driving"
                  increment={0.01}
                  initial={this.state.cityProportion}
                  onChange={this.handleSliderChange}
                />
              </td>
              <td>{(this.state.cityProportion*100).toFixed(0)} %</td>
            </tr>
            <tr>
              <td>Estimated Economy: </td>
              <td>{parseFloat(estimatedEconomy).toFixed(1)} {unitText}</td>
            </tr>
            <tr>
              <td>Fuel Type:</td>
              <td>{this.props.data.fuelType}</td>
            </tr>
          </tbody>
        </table>
        {saveVehicleDisplay}
        <div className="row">
          <button
            type="button"
            className="btn-outline-primary"
            onClick={this.handleSubmit}
          >
            Use these values
          </button>
          <button
            type="button"
            className="btn-outline-danger"
            onClick={this.props.hideForm}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}



export class VehicleForm extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      name: null,
      vehicleId: null,
      highwayLper100Km: 0,
      cityLper100Km: 0,
      fuelType: null,
    }

    this.normaliseFuelType = this.normaliseFuelType.bind(this)
  }

  normaliseFuelType(fuelRaw){
    let fuelNorm = findFuel(fuelRaw)
    this.setState({fuelType: fuelNorm})
  }

  receiveVehicleId(name, num){
    if (!num){
      this.setState({ name: null,
                      vehicleId: null,
                      highwayLper100Km: 0,
                      cityLper100Km: 0,
                      fuelType: null,
                    })
      return;
    }

    //console.log("Searching for economy by ID..." +num);
    this.setState({name: name});
    this.setState({vehicleId: num});

    let url="https://www.fueleconomy.gov/ws/rest/vehicle/"
    let suffix = num

    fetch(url+suffix)
    .then(res => res.text())
    .then(
      (result) => {
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(result, "text/xml");

          let highwayMpg = xmlDoc.getElementsByTagName('highway08');
          this.setState({highwayLper100Km: units.USMpgToMetric(parseFloat(highwayMpg[0].childNodes[0].nodeValue), this.props.displayUnits)});

          let cityMpg = xmlDoc.getElementsByTagName('city08');
          this.setState({cityLper100Km: units.USMpgToMetric(parseFloat(cityMpg[0].childNodes[0].nodeValue), this.props.displayUnits)});

          let fuelType = xmlDoc.getElementsByTagName('fuelType1');
          this.normaliseFuelType((fuelType[0].childNodes[0].nodeValue))
        },
      (error) => {
          console.log("Error");
      }
    ) 
  }

  render(){
    let display
    if(this.state.vehicleId){
      display = <div>
                  <VehicleInputFields 
                    returnVehicleId ={(name,num) => this.receiveVehicleId(name,num)}
                  />
                  <VehicleResult  
                    data = {this.state}
                    submitVehicle = {this.props.submitVehicle}
                    displayUnits = {this.props.displayUnits}
                    hideForm = {this.props.hideForm}
                    saveVehicle = {this.props.saveVehicle}
                    loggedIn={this.props.loggedIn}
                    saveAs={this.props.saveAs}
                    vehicleWillSave={this.props.vehicleWillSave}
                  />
                </div>
    } else {
      display = <div>
                  <VehicleInputFields 
                    returnVehicleId ={(name,num) => this.receiveVehicleId(name,num)}
                  />
                  <button
                    type="button"
                    className="btn-outline-danger"
                    onClick={this.props.hideForm}
                  >
                    Cancel
                  </button>
                </div>
    }

    return(
      <div className="container-sm bg-success">
        {display}
      </div>
    );
  }
}

