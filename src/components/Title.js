import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

const Title = React.forwardRef(function Title(props, ref) {
  return (
    <Typography {...props} component="h2" variant="h6" color="primary" gutterBottom ref={ref}>
      {props.children}
    </Typography>
  );
});

Title.propTypes = {
  children: PropTypes.node,
};

export default Title;
