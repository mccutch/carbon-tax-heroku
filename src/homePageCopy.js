import React from 'react';

const copyTabs  = [
      {name:'why', label:"Why"},
      {name:'how', label:"How"},
      {name:'what', label:"What"},
      {name:'about', label:"About"}
    ]

export class HomePageCopy extends React.Component{
  constructor(props){
    super(props)
    this.state={activeTab:copyTabs[0].name}
    this.buildTabs=this.buildTabs.bind(this)
  }

  buildTabs(){
    let tabList=[]
    let list = copyTabs
    for(let i in list){
      tabList.push(
        <p  name={list[i].name} 
            class={`nav-link text-${this.state.activeTab===list[i].name?"warning":"light"}`}
            onClick={()=>this.setState({activeTab:list[i].name})}
        >{list[i].label}</p>
      )
    }
    return tabList
  }

  render(){
    return(
      <div className="container bg-dark rounded" style={{opacity:0.8}}>
        <nav class="nav justify-content-center text-light" style={{opacity:1}}>
          {this.buildTabs()} 
        </nav>
        <div className="container text-light text-justify">
          {this.state.activeTab==='why'?
            <p>
              You want the world to change, but your vote just doesn't seem to be working fast enough.
              Global climate change demands urgent and unprecedented action, but until until that happens, what power do you have?
              <br/><br/>
              <strong><em>Carbon Accountant</em> empowers you to take action within your own means. If you can
              afford to pollute the planet, you can afford to help it, too.</strong>
              <br/><br/>
              You decide how much that should be, you decide where that money should go.
              You could donate, you could offset. Maybe you'll lobby politcians, maybe you'll invest, maybe you'll invest in yourself.
              <br/><br/>
              Tax yourself only what you can afford, but don't fear a little discomfort, because that's the point. 
              What is your impact worth?
            </p>
          :""}
          {this.state.activeTab==='how'?
            <p>
              <em>Carbon Accountant</em> aims to be an accessible tool for calculating the carbon output of your trips, 
              that can be installed as a PWA to your mobile's home screen.
              <br/><br/>
              Input your trips using the calculator, then apply a customisable tax on the carbon emissions. 
              <br/><br/>
              After that, it's up to you what to do with the money, but you can use the app to record how you've donated, spent or saved it.
            </p>
          :""}
          {this.state.activeTab==='what'?
            <p>
              Is this another carbon offset scheme?
              <br/><br/>
              If you want it to be, then sure. But the real power of <em>Carbon Accountant</em> is as a tax. 
              <br/><br/>
              For the tax to be effective, it should change behaviour. You decide where the threshold lies between effectiveness and affordability. 
              It's your money, as you get to decide where it is spent.
              <br/><br/>
              If this tax helps you question the amount you're flying, or whether you should be riding to work more often, then it's working.
            </p>
          :""}
          {this.state.activeTab==='about'?
            <p>
              In the years since Australia's carbon pricing legislation was repealed in 2014, I've found myself frustrated at this deliberate lack 
              of action in the face of climate change.
              <br/><br/>
              But in my own actions, I was doing everything I could to travel and spend time outdoors, 
              but felt like I never had pockets deep enough to donate towards change.
              <br/><br/>
              The irony eventually settled in and in 2017 I started a spreadsheet, calculating a proportion on any money spend polluting that 
              I should donate to an environmental charity. 
              <br/><br/>
              Carbon Accountant has finally become a website, in the hope that it reaches those who want it.
              <br/><br/>
              Jack McCutchan, Oct 2020
            </p>
          :""}
        </div>
      </div>
    )
  }
}