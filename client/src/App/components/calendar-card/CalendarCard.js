import React from "react";
import { Card, CardContent, CardActionArea } from "@material-ui/core";

class CalendarCard extends React.Component {
  render() {
      const {date, onClickDate} = this.props;
    return (
      <Card>
      <CardActionArea onClick={onClickDate}>
        <CardContent>
        {date}
        </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

export default CalendarCard;
