import { Schema, models, model } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    companyId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Company = models.Company || model("Company", CompanySchema);

export default Company;