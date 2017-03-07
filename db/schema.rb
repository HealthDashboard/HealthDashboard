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

ActiveRecord::Schema.define(version: 20170307173636) do

  create_table "health_centre_specialties", force: :cascade do |t|
    t.integer  "health_centre_id"
    t.integer  "specialty_id"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
    t.index ["health_centre_id"], name: "index_health_centre_specialties_on_health_centre_id"
    t.index ["specialty_id"], name: "index_health_centre_specialties_on_specialty_id"
  end

  create_table "health_centres", force: :cascade do |t|
    t.float    "long"
    t.float    "lat"
    t.string   "cnes"
    t.string   "name"
    t.integer  "beds"
    t.string   "phone"
    t.string   "census_district"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "procedures", force: :cascade do |t|
    t.string   "date"
    t.string   "age_code"
    t.string   "age_number"
    t.string   "gender"
    t.string   "race"
    t.string   "different_district"
    t.string   "cep_patient"
    t.string   "cid_associated"
    t.string   "cid_primary"
    t.string   "cid_secondary"
    t.string   "ethnicity"
    t.float    "long"
    t.float    "lat"
    t.integer  "cnes_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.float    "distance"
    t.integer  "specialty_id"
    t.index ["specialty_id"], name: "index_procedures_on_specialty_id"
  end

  create_table "specialties", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

end
