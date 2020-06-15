import React from 'react';
import { 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Bar,
  BarChart,
} from 'recharts';

const colourList = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']


export class Histogram extends React.Component{

  buildBars(){
      let bars = []
      let barValues = this.props.barValues
      for(let i in barValues){
        bars.push(<Bar dataKey={barValues[i]} fill={colourList[i]} />)
      }
      return bars
    }

  render(){

    let data = this.props.data
    if(this.props.sort){
      data.sort(function(a, b) { 
        return b[this.props.barValues[0]] - a[this.props.barValues[0]];
      })
    }

    let legend 
    if(this.props.barValues.length>1){
      legend = <Legend />
    }

    return(
      <div className="container">
        <h4 className="text-center">{this.props.title}</h4>
        <ResponsiveContainer height={300}>

          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid stroke="#ccc" />
            <XAxis type="number"/>
            <YAxis type="category" dataKey={this.props.labelKey}/>
            {this.buildBars()}
            {legend}
          </BarChart>
        </ResponsiveContainer> 
      </div>
    )
  }
}




export class LinePlot extends React.Component{

  buildLines(){
    let lines = []
    let dataSeries = this.props.dataSeries
    for(let i in dataSeries){
      lines.push(<Line type="monotone" dataKey={dataSeries[i]} stroke={colourList[i]} />)
    }
    return lines
  }


  render(){
    let data = this.props.data

    return(
      <div className="container">
        <h4 className="text-center">{this.props.title}</h4>
        <ResponsiveContainer height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {this.buildLines()}
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey={this.props.x_key} padding={{ left: 30, right: 30 }}/>
            <YAxis />
            {/*<Tooltip />*/}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
}




