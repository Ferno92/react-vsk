import React from 'react'
class NoMatch extends React.Component{
    constructor(props){
        super(props);

        props.history.push("/");
    }

    render(){
        return (
          <div>
          </div>
        );
      }
}
  export default NoMatch;