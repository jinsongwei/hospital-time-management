/**
 *   author: William Jin
 */

let schemaGate = require('../index');

let schemaDefine = {
    case_id: "log_id",
    create_date: "create_date",
    update_date: "last_update_date",
    scheduled_surgery_date: "sched_surgery_date",
    class_name: "case_class_name",
    surgeon_request_length: "surgeon_req_len",
    setup_minutes: "setup_minutes",
    cleanup_minutes: "cleanup_minutes",
    total_time_needed: "total_time_needed",
    add_on_case_yn: "add_on_case_yn",
    sched_status_class: "sched_status_c",
    sched_status_name: "sched_status_name",
    cancel_date: "cancel_date",
    cancel_reason_class: "cancel_reason_c",
    cancel_reason_name: "cancel_reason_name",
    service_class:"service_c",
    service_name: "service_name",
    parent_location_id: "parent_location_id",
    location_id: "location_id",
    location_name: "location_name",
    room_id: "room_id",
    room_name: "room_name",
    schedule_setup_start_dttm: "sched_setup_start_dttm",
    schedule_in_room_dttm: "sched_in_room_dttm",
    schedule_out_room_dttm: "sched_out_room_dttm",
    schedule_cleanup_comp_dttm: "sched_cleanup_comp_dttm",
    room_setup_start_dttm: "room_setup_start_dttm",
    room_ready_dttm: "room_ready_dttm",
    patient_in_room_dttm: "patient_in_room_dttm",
    patient_out_room_dttm: "patient_out_room_dttm",
    room_cleanup_start_dttm: "room_cleanup_start_dttm",
    room_cleanup_comp_dttm: "room_cleanup_comp_dttm",
};

schemaGate.registerSchema('hospital1', '1.0.0', schemaDefine, (err, data) => {
    if (err) console.error(err);
    else console.log(data);
});

