import React from 'react';

export class OptionListInput extends React.Component{

  render(){
      let list = this.props.list;
      let listOptions = [];
      for(let i=0; i<list.length; i++){
        listOptions.push(<option 
                            value={list[i]}
                            key = {i}
                          >
                          {list[i]}</option>)
      }
      return  <select
                id = {this.props.name}
                onChange = {this.props.onChange}
                name = {this.props.name}
                defaultValue = {this.props.defaultValue}
                className = "form-control my-2"
              >
                {listOptions}
              </select>
  }
}