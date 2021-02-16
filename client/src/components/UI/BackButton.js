import React from "react";
import { Button } from "reactstrap";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";

const BackButton = ({ state, setState }) => {
	const history = useHistory();

	const handleBack = () => {
		if (state) {
			setState({ ...state, ["worker_id"]: "", ["worker"]: "" });
		}
		history.goBack();
	};

	return (
		<Button color="primary" onClick={handleBack} className="d-print-none">
			Back
		</Button>
	);
};

BackButton.propTypes = {
	state: PropTypes.object,
	setState: PropTypes.func,
};

export default BackButton;
