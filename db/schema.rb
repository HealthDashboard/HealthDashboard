# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190207130814) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "health_centre_specialties", force: :cascade do |t|
    t.integer  "health_centre_id"
    t.integer  "specialty_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.index ["health_centre_id"], name: "index_health_centre_specialties_on_health_centre_id", using: :btree
    t.index ["specialty_id"], name: "index_health_centre_specialties_on_specialty_id", using: :btree
  end

  create_table "health_centre_types", force: :cascade do |t|
    t.integer  "health_centre_id"
    t.integer  "type_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.index ["health_centre_id"], name: "index_health_centre_types_on_health_centre_id", using: :btree
    t.index ["type_id"], name: "index_health_centre_types_on_type_id", using: :btree
  end

  create_table "health_centres", force: :cascade do |t|
    t.integer  "cnes"
    t.string   "name"
    t.string   "name_r"
    t.integer  "beds"
    t.float    "long"
    t.float    "lat"
    t.string   "phone"
    t.string   "adm"
    t.string   "DA"
    t.string   "PR"
    t.string   "STS"
    t.string   "CRS"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "procedures", force: :cascade do |t|
    t.string   "cd_geocodi"
    t.float    "lat"
    t.float    "long"
    t.string   "gender"
    t.integer  "age_number"
    t.string   "age_code"
    t.integer  "race"
    t.integer  "lv_instruction"
    t.integer  "cnes_id"
    t.integer  "gestor_ide"
    t.integer  "treatment_type"
    t.integer  "cmpt"
    t.date     "date"
    t.date     "date_in"
    t.date     "date_out"
    t.integer  "complexity"
    t.integer  "proce_re"
    t.string   "cid_primary"
    t.string   "cid_secondary"
    t.string   "cid_secondary2"
    t.string   "cid_associated"
    t.integer  "days"
    t.integer  "days_uti"
    t.integer  "days_ui"
    t.integer  "days_total"
    t.integer  "finance"
    t.float    "val_total"
    t.string   "DA"
    t.string   "PR"
    t.string   "STS"
    t.string   "CRS"
    t.float    "distance"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.integer  "specialty_id"
    t.index ["specialty_id"], name: "index_procedures_on_specialty_id", using: :btree
  end

  create_table "sectors", force: :cascade do |t|
    t.string   "cd_geocodi"
    t.string   "DA"
    t.string   "coordinates"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  create_table "specialties", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "types", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "health_centre_specialties", "health_centres"
  add_foreign_key "health_centre_specialties", "specialties"
  add_foreign_key "health_centre_types", "health_centres"
  add_foreign_key "health_centre_types", "types"
  add_foreign_key "procedures", "specialties"
end
