import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { Container, Form, Button } from "reactstrap";
import {
	SelectCustomer,
	SelectBranch,
	SelectWorker,
	SelectDate,
	SelectTime,
	SelectDuration,
	UnitPriceInput,
	DetailsInput,
	CleaningServiceInput,
	SelectStartTime,
	SelectEndTime,
	WorkerFeedback,
	Title,
	BackButton,
} from "../components";
import { postJobs, putJobs } from "../service";
import useAuthorizationHeaders from "../hooks/useAuthorizationHeaders";

const Jobs = ({
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
	job_id,
	feedback,
	comment,
	cleaning_service,
}) => {
	const [state, setState] = useState({
		customer: customer || "",
		customer_id: customer_id || "",
		branch: branch || "",
		branch_id: branch_id || "",
		worker: worker || "",
		worker_id: worker_id || "",
		details: details || "",
		comment: comment || "",
		cleaning_service: cleaning_service || "",
		visit_on: visit_on || "",
		visit_time: visit_time || "",
		duration: duration || "1",
		unit_price: unit_price || "",
		start_time: start_time || "",
		end_time: end_time || "",
		feedback,
	});
	const [errors, setErrors] = useState({});
	const history = useHistory();
	const authorizationHeaders = useAuthorizationHeaders();
	const queryClient = useQueryClient();

	const jobMutation = useMutation(
		({ method, id, data, options }) => {
			if (method === "post") {
				return postJobs(data, options);
			} else {
				return putJobs(id, data, options);
			}
		},
		{
			onError: (error) => {
				console.log(error);
			},
			onSuccess: (data, { id }) => {
				if (data.errors) {
					setErrors(formatErrors(data.errors));
				} else {
					if (id) {
						// update cached data needed only when updating (put) job
						setTimeout(() =>
							queryClient.setQueryData(`/jobs/${id}`, (oldData) => ({
								...oldData,
								data,
							}))
						);
					}
					history.goBack();
				}
			},
		}
	);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!job_id) {
			jobMutation.mutate({
				method: "post",
				data: state,
				options: authorizationHeaders,
			});
		} else {
			jobMutation.mutate({
				method: "put",
				id: job_id,
				data: state,
				options: authorizationHeaders,
			});
		}
	};

	const formatErrors = (errors) =>
		errors.reduce((acc, error) => {
			acc[error.param] = error.msg;
			return acc;
		}, {});

	return (
		<Container className="mb-5">
			<Title text={job_id ? "Edit Job" : "Create Job"} />
			<Form onSubmit={handleSubmit}>
				<SelectCustomer
					state={state}
					setState={setState}
					error={errors.customer}
				/>
				<SelectBranch state={state} setState={setState} error={errors.branch} />
				<SelectWorker state={state} setState={setState} error={errors.worker} />
				<div className="d-sm-flex justify-content-between">
					<SelectDate
						state={state}
						setState={setState}
						error={errors.visit_on}
					/>
					<SelectTime
						state={state}
						setState={setState}
						error={errors.visit_time}
					/>
				</div>
				<div className="d-sm-flex justify-content-between">
					<SelectDuration
						state={state}
						setState={setState}
						error={errors.duration}
					/>
					<UnitPriceInput
						state={state}
						setState={setState}
						error={errors.unit_price}
					/>
				</div>
				<CleaningServiceInput
					state={state}
					setState={setState}
					error={errors.cleaning_service}
				/>
				<DetailsInput
					state={state}
					setState={setState}
					error={errors.details}
					name="details"
				/>
				<DetailsInput
					state={state}
					setState={setState}
					error={errors.comment}
					name="comment"
				/>
				<div className="border rounded-lg p-3 mb-5">
					<div className="mb-2">
						These fields should be completed only if the cleaner is unable to
						log time by himself.
					</div>
					<div className="d-sm-flex justify-content-between">
						<SelectStartTime
							state={state}
							setState={setState}
							error={errors.start_time}
						/>
						<SelectEndTime
							state={state}
							setState={setState}
							error={errors.end_time}
						/>
					</div>
					<WorkerFeedback feedback={feedback} />
				</div>
				<div className="d-flex justify-content-end mb-4">
					<BackButton />
					<Button type="submit" className="ml-4">
						Save
					</Button>
				</div>
			</Form>
		</Container>
	);
};

Jobs.propTypes = {
	customer: PropTypes.string,
	customer_id: PropTypes.number,
	branch: PropTypes.string,
	branch_id: PropTypes.number,
	worker: PropTypes.string,
	worker_id: PropTypes.number,
	details: PropTypes.string,
	visit_on: PropTypes.string,
	visit_time: PropTypes.string,
	duration: PropTypes.number,
	unit_price: PropTypes.number,
	start_time: PropTypes.string,
	end_time: PropTypes.string,
	job_id: PropTypes.number,
	feedback: PropTypes.string,
	comment: PropTypes.string,
	cleaning_service: PropTypes.string,
};

export default Jobs;
