import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Link as RouterLink } from "react-router-dom";

export default function ListItemLink(props) {
    const { icon, primary, to } = props;

    const renderLink = React.useMemo(
        () => {
            return React.forwardRef(
                (itemProps, ref) => {
                    return <RouterLink to={to} ref={ref} {...itemProps} />;
                }
            );
        },
        [to],
    );

    return (
        <li>
            <ListItem button component={renderLink}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary} />
            </ListItem>
        </li>
    );
}

ListItemLink.propTypes = {
    icon: PropTypes.element,
    primary: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  };
