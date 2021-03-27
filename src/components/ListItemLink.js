import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Link as RouterLink, useRouteMatch } from "react-router-dom";

export default function ListItemLink({ icon, primary, to, exact }) {
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
    const match = useRouteMatch({ path: to.replace(/(#.*$)|(\?.*$)/, ''), exact });

    return (
        <li>
            <ListItem button component={match ? null : renderLink} selected={!!match}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary} />
            </ListItem>
        </li>
    );
}
