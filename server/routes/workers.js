import { Router } from "express";
import { body, validationResult } from "express-validator";
import { PhoneNumberUtil } from "google-libphonenumber";
import db from "../db";
import { formatWorkerJobs } from "../util/formatJobs";
import { checkAuth, checkPermission } from "../middleware";

const router = new Router();
const phoneUtil = PhoneNumberUtil.getInstance();

router.get(
	"/workers",
	checkAuth,
	checkPermission("get:workers"),
	(_, res, next) => {
		db.query("SELECT * FROM workers ORDER BY name")
			.then(({ rows }) => {
				return res.json({ workers: rows });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.get(
	"/workers/select",
	checkAuth,
	checkPermission("get:workers/select"),
	(_, res, next) => {
		db.query("SELECT * FROM workers WHERE archived='f'")
			.then(({ rows }) => {
				return res.json({ workers: rows });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.get(
	"/workers/jobs",
	checkAuth,
	checkPermission("get:workers/jobs"),
	(req, res, next) => {
		db.query(
			`SELECT j.id, j.visit_on, j.visit_time, j.status, b.address, c.name
				FROM jobs j
				INNER JOIN branches b ON j.branch_id=b.id
				INNER JOIN workers w ON w.id=j.worker_id
				INNER JOIN customers c ON c.id=j.customer_id
				WHERE w.email=$1
				ORDER BY j.visit_on
			`,
			[req.user["https://springactioncleaning/email"]]
		)
			.then(({ rows }) => {
				return res.json({ jobs: formatWorkerJobs(rows) });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.get(
	"/workers/:id",
	checkAuth,
	checkPermission("get:workersById"),
	(req, res, next) => {
		const { id } = req.params;

		db.query("SELECT * FROM workers WHERE id=$1", [id])
			.then(({ rows }) => {
				return res.json({ workers: rows });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.get(
	"/workers/job/:id",
	checkAuth,
	checkPermission("get:workers/job/:id"),
	(req, res, next) => {
		const { id } = req.params;
		const email = req.user["https://springactioncleaning/email"];

		db.query(
			`SELECT b.address, b.contact_name, b.contact_phone, b.details branch_details, j.*, c.name customer, w.name worker, w.email
				FROM jobs j
				INNER JOIN branches b ON j.branch_id=b.id
				INNER JOIN customers c ON j.customer_id=c.id
				INNER JOIN workers w ON w.id=j.worker_id
				WHERE j.id=$1 AND w.email=$2
			`,
			[id, email]
		)
			.then(({ rows }) => {
				return res.json({ jobs: formatWorkerJobs(rows) });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.post(
	"/workers",
	checkAuth,
	checkPermission("post:workers"),
	[
		body("email", "Please provide a valid email").isEmail().normalizeEmail(),
		body("email", "Max length is 60 characters").isLength({ max: 60 }),
		body("name", "Name is required").not().isEmpty().trim(),
		body("name", "Max length is 100 characters").isLength({ max: 100 }),
		body("address", "Address is required").not().isEmpty().trim(),
		body("address", "Max length is 100 characters").isLength({ max: 100 }),
		body("phone", "Not a valid GB number").custom((value) =>
			phoneUtil.isValidNumberForRegion(phoneUtil.parse(value, "GB"), "GB")
		),
		body("phone", "Phone is required").not().isEmpty().trim(),
		body("whatsapp", "Whatsapp is required").not().isEmpty().trim(),
		body("whatsapp", "Max length is 50 characters").isLength({ max: 50 }),
		body("contract", "Contract is required").isBoolean(),
		body("archived", "Archived is required").isBoolean(),
		body("languages", "Max length is 50 characters")
			.isLength({ max: 50 })
			.trim(),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(200).json({ success: false, errors: errors.array() });
		}

		const {
			name,
			address,
			email,
			phone,
			whatsapp,
			contract,
			languages,
			archived,
		} = req.body;

		db.query(
			`INSERT INTO workers (name, email, phone_number, address, whatsapp, permanent_contract, languages, archived)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
			[name, email, phone, address, whatsapp, contract, languages, archived]
		)
			.then(({ rowCount }) => {
				if (rowCount < 1) {
					return res
						.status(400)
						.json({ success: false, message: "Worker not added." });
				} else {
					return res.json({ success: true });
				}
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

router.put(
	"/workers/:id",
	checkAuth,
	checkPermission("put:workers"),
	[
		body("email", "Please provide a valid email").isEmail().normalizeEmail(),
		body("email", "Max length is 60 characters").isLength({ max: 60 }),
		body("name", "Name is required").not().isEmpty().trim(),
		body("name", "Max length is 100 characters").isLength({ max: 100 }),
		body("address", "Address is required").not().isEmpty().trim(),
		body("address", "Max length is 100 characters").isLength({ max: 100 }),
		body("phone", "Not a valid GB number").custom((value) =>
			phoneUtil.isValidNumberForRegion(phoneUtil.parse(value, "GB"), "GB")
		),
		body("phone", "Phone is required").not().isEmpty().trim(),
		body("whatsapp", "Whatsapp is required").not().isEmpty().trim(),
		body("whatsapp", "Max length is 50 characters").isLength({ max: 50 }),
		body("contract", "Contract is required").isBoolean(),
		body("archived", "Archived is required").isBoolean(),
		body("languages", "Max length is 50 characters")
			.isLength({ max: 50 })
			.trim(),
	],
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(200).json({ success: false, errors: errors.array() });
		}
		const { id } = req.params;
		const {
			name,
			address,
			email,
			phone,
			whatsapp,
			contract,
			languages,
			archived,
		} = req.body;

		db.query(
			`
			UPDATE workers
			SET name=$1, address=$2, email=$3, phone_number=$4, whatsapp=$5, permanent_contract=$6, languages=$7, archived=$8
			WHERE id=$9
			`,
			[name, address, email, phone, whatsapp, contract, languages, archived, id]
		)
			.then(() => {
				return res.json({ success: true });
			})
			.catch((e) => {
				console.error(e);
				next(e);
			});
	}
);

export default router;
