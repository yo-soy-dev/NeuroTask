import express from "express";
import { body } from "express-validator";

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  uploadAttachment,
  deleteAttachment,
  exportTasks,
  downloadAttachment,
  openAttachment,
  
} from "../controllers/taskController.js";

import {
  getComments,
  addComment,
} from "../controllers/commentController.js";

import { protect, adminOnly } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Stats
router.get("/stats", getTaskStats);
router.get("/export", exportTasks);

// Tasks
router.get("/", getTasks);
router.get("/:id", getTask);

router.post(
  "/",
  adminOnly,
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3–100 characters."),

    body("status")
      .optional()
      .isIn(["todo", "in-progress", "review", "completed"])
      .withMessage("Invalid status."),

    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid priority."),

    body("category")
      .optional()
      .isIn([
        "general",
        "bug",
        "feature",
        "design",
        "devops",
        "documentation",
        "testing",
        "research",
      ])
      .withMessage("Invalid category."),

    body("progress")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be 0–100."),

    body("dueDate")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("Invalid date."),
  ],
  validate,
  createTask
);

router.put(
  "/:id",
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be 3–100 characters."),

    body("status")
      .optional()
      .isIn(["todo", "in-progress", "review", "completed"])
      .withMessage("Invalid status."),

    body("progress")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be 0–100."),
  ],
  validate,
  updateTask
);

router.delete("/:id", adminOnly, deleteTask);

// Attachments
router.post(
  "/:id/attachments",
  upload.single("file"),
  uploadAttachment
);

router.delete(
  "/:id/attachments/:attachmentId",
  deleteAttachment
);

router.get(
  '/:id/attachments/:attachmentId/open', 
  openAttachment
);

router.get(
  '/:id/attachments/:attachmentId/download',
   downloadAttachment
);

// Comments
router.get("/:taskId/comments", getComments);

router.post(
  "/:taskId/comments",
  [
    body("text")
      .trim()
      .notEmpty()
      .withMessage("Comment required."),
  ],
  validate,
  addComment
);

export default router;