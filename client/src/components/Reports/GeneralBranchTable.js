import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";

const GeneralBranchTable = ({ data, state, setState, tableFooter }) => {
	const history = useHistory();

	const formatDuration = ({ hours = 0, minutes = 0 }) => {
		return (
			hours.toString().padStart(2, "0") +
			":" +
			minutes.toString().padStart(2, "0")
		);
	};

	const handleClick = (id, address) => {
		setState({ ...state, branch_id: id, branch: address });
		history.push("/result_branch"); // Go to <BranchReportPage>
	};

	const handleKeyPress = (id, address, e) => {
		setState({ ...state, branch_id: id, branch: address });
		if (e.key === "Enter" && e.target.tagName === "TR") {
			history.push("/result_branch"); // Go to <BranchReportPage>
		}
	};

	return (
		<tbody>
			{data.map(({ id, contracted_duration, actual_duration, address }) => (
				<tr
					key={id || 0} //In the case of displaying the final line, use 0 for the key and prohibit actions.
					role={id && "button"}
					onClick={() => id && handleClick(id, address)}
					onKeyPress={(e) => id && handleKeyPress(id, address, e)}
					tabIndex={id && 0}
				>
					<th
						scope="row"
						className={tableFooter && "font-weight-bold text-right"}
					>
						{tableFooter ? "Total duration:" : address}
					</th>
					<td className={tableFooter && "font-weight-bold"}>
						{formatDuration(contracted_duration)}
					</td>
					<td className={tableFooter && "font-weight-bold"}>
						{formatDuration(actual_duration)}
					</td>
				</tr>
			))}
		</tbody>
	);
};

GeneralBranchTable.propTypes = {
	data: PropTypes.array,
	tableFooter: PropTypes.bool,
	state: PropTypes.object,
	setState: PropTypes.func,
};

export default GeneralBranchTable;
