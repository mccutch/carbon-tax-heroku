import React from 'react';
import { 
  //LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  Bar,
  BarChart,
  Label,
  ComposedChart,
  Area,
} from 'recharts';

export const colourList = ["2b9348", "c94277", "b7990d", "9b5de5", "99582a", "3a86ff", "8ac926", "6a7b76", "ff6542", "f15bb5",]


function XLabel(label){
  return <Label value={label} position="bottom" offset={0} />
}

function YLabel(label){
  return <Label value={label} angle="-90" position="left" />
}

export class Histogram extends React.Component{

  buildBars(){
      let bars = []
      let barValues = this.props.barValues
      for(let i in barValues){
        bars.push(<Bar dataKey={barValues[i]} fill={`#${colourList[i]}`} />)
      }
      return bars
    }

  render(){

    let data = this.props.data

    let legend 
    if(this.props.barValues.length>1){
      legend = <Legend />
    }

    return(
      <div className="container">
        <h5 className="text-center">{this.props.title}</h5>
        <ResponsiveContainer height={300}>
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 40, bottom: 20 }}
            layout="vertical"
          >
            <CartesianGrid stroke="#ccc" />
            <XAxis type="number">
              {XLabel(this.props.xLabel)}
            </XAxis>
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
      lines.push(
        <Line 
          type="monotone" 
          dataKey={dataSeries[i]} 
          stroke={`#${colourList[i]}`} 
          strokeWidth={2} 
          dot={false}
        />
      )
    }
    return lines
  }

  render(){
    let data = this.props.data

    return(
      
      <div className="container">
        <div className="row align-items-center">
          <div className="col-sm-8">
            <h5 className="text-center">{this.props.title}</h5>
          </div>
          <div className="col-sm-4 justify-content-center">
            <div className="center-block">{this.props.switches}</div>
          </div>
        </div>
        <ResponsiveContainer height={400}>
          <ComposedChart data={data} margin={{ top: 35, right: 0, left: 0, bottom: 20 }}>
            {this.buildLines()}
            {/*<Area type="monotone" dataKey="Total" fill="#8884d8" stroke="#8884d8" />*/}
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey={this.props.x_key} padding={{ left: 10, right: 10 }}>
              <Label value={this.props.xLabel} position="bottom" offset={0} />
            </XAxis>
            <YAxis mirror tickMargin={0}>
              <Label value={this.props.yLabel} /*angle="-90"*/ position="insideTopLeft" dy={-35} dx={0}/>
            </YAxis>
            <Tooltip 
              formatter = {(value, name, props) => {return [`${this.props.preUnit}${Math.round(value)}${this.props.postUnit}`, `${name}`] }}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }
}




