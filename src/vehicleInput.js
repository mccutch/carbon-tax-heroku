import React from 'react';
import './index.css';




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
      year: '1998',
      make: 'Ford',
      model: 'Escort',
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
      <div class="container">
        <div class="container">
          <h2>US Database Vehicle Input</h2>
        </div>
        <div class="container">
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

    this.state = {cityProportion: 0.55,}
    this.handleSliderChange = this.handleSliderChange.bind(this);

    this.handleClick=this.handleClick.bind(this)
  }

  handleSliderChange(event){
    this.setState({cityProportion: event.target.value})
  }

  handleClick(){
    if(this.props.data.vehicleId){
      this.props.submitVehicle(this.props.data.name, this.findEconomy(), this.props.data.fuelType);
    }
  }

  findEconomy(){
    return(
      this.props.convertFromUSMpg(
          (this.state.cityProportion * this.props.data.cityMpg) 
            + (1-this.state.cityProportion)*this.props.data.highwayMpg
      )
    );
  }

  render(){
    let estimatedEconomy = this.findEconomy();
    let highwayEconomy = this.props.convertFromUSMpg(this.props.data.highwayMpg);
    let cityEconomy = this.props.convertFromUSMpg(this.props.data.cityMpg);
    let unitText = this.props.convertFromUSMpg();

    return(
      <div class="container">
        <div class="row bg-light text-right">
              <p>Vehicle: {this.props.data.name}</p>
        </div>
        <div class="row">
          <div class="col-sm">
            <p>Highway Economy:</p>
          </div>
          <div class="col-sm">
            <p>{parseFloat(highwayEconomy).toFixed(1)} {unitText}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm">
            <p>City Economy:</p>
          </div>
          <div class="col-sm">
            <p>{parseFloat(cityEconomy).toFixed(1)} {unitText}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm">
            <p>City Driving: </p>
          </div>
          <div class="col-sm">
            <p>{(this.state.cityProportion*100).toFixed(0)} %</p>
          </div>
        </div>
        <SliderInput
          label="Proportion of city driving"
          name ="cityProportion"
          start="All city driving"
          end="All highway driving"
          increment={0.01}
          initial={this.state.cityProportion}
          onChange={this.handleSliderChange}
        />
        <div class="row">
          <div class="col-sm">
            <p>Estimated Economy: </p>
          </div>
          <div class="col-sm">
            <p>{parseFloat(estimatedEconomy).toFixed(1)} {unitText}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-sm">
            <p>Fuel Type:</p>
          </div>
          <div class="col-sm">
            <p>{this.props.data.fuelType}</p>
          </div>
        </div>
        <button
          type="button"
          class="btn-outline-primary"
          onClick={this.handleClick}
        >
          Use these values
        </button>
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
      highwayMpg: 0,
      cityMpg: 0,
      fuelType: null,
    }
  }

  receiveVehicleId(name, num){
    if (!num){
      this.setState({ name: null,
                      vehicleId: null,
                      highwayMpg: 0,
                      cityMpg: 0,
                      fuelType: null,
                    })
      return;
    }

    this.setState({name: name});

    console.log("Searching for economy by ID..." +num);
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
          this.setState({highwayMpg: parseFloat(highwayMpg[0].childNodes[0].nodeValue)});

          let cityMpg = xmlDoc.getElementsByTagName('city08');
          this.setState({cityMpg: parseFloat(cityMpg[0].childNodes[0].nodeValue)});

          let fuelType = xmlDoc.getElementsByTagName('fuelType1');
          this.setState({fuelType: (fuelType[0].childNodes[0].nodeValue)});
        },
      (error) => {
          console.log("Error");
      }
    ) 
  }


  render(){
    return(
      <div class="container-sm bg-light">
        <VehicleInputFields 
          returnVehicleId ={(name,num) => this.receiveVehicleId(name,num)} />
        <VehicleResult  data = {this.state}
                        submitVehicle = {this.props.submitVehicle}
                        convertFromUSMpg={this.props.convertFromUSMpg}
                        units = {this.props.units}
        />
      </div>
    );
  }
}

