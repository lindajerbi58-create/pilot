import mongoose, { Schema, models, model } from "mongoose";

const TaskSchema = new Schema(
  {
    task_name: { type: String, required: true },
    project_name: { type: String, required: true },
    assignee_email: { type: String, required: true },
    status: { type: String, required: true },
    priority: { type: String, required: true },
    start_date: { type: String, required: true },
    due_date: { type: String, required: true },
    progress: { type: Number, required: true },
    companyId: {
  type: String,
  required: true,
  index: true,
},
taskId: {
  type: String,
  required: true,
  index: true,
},
  },
  { timestamps: true }
);

const Task = models.Task || model("Task", TaskSchema);

export default Task;