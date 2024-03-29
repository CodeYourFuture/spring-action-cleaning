import React from "react";
import { useParams } from "react-router-dom";
import CreateJob from "./CreateJob";
import Spinner from "../components/UI/Spinner";
import useFetch from "../hooks/useFetch";

const EditJob = () => {
	const { id } = useParams();
	const { data, isLoading, error } = useFetch(`/jobs/${id}`);

	if (error) {
		return <div>Oops, something went wrong.</div>;
	} else if (isLoading) {
		return <Spinner />;
	} else {
		const {
			customer,
			customer_id,
			branch,
			branch_id,
			worker,
			worker_id,
			details,
			visit_on,
			visit_time,
			duration,
			unit_price,
			start_time,
			end_time,
			id,
			feedback,
			comment,
			cleaning_service,
		} = data.job;

		const visitDate = visit_on.split("T")[0];

		return (
			<div>
				<CreateJob
					customer={customer}
					customer_id={customer_id}
					branch={branch}
					branch_id={branch_id}
					worker={worker}
					worker_id={worker_id}
					details={details}
					visit_on={visitDate}
					visit_time={visit_time}
					duration={duration}
					unit_price={unit_price}
					start_time={start_time}
					end_time={end_time}
					job_id={id}
					feedback={feedback}
					comment={comment}
					cleaning_service={cleaning_service}
				/>
			</div>
		);
	}
};

export default EditJob;
