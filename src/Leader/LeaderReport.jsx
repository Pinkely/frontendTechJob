import React, { useState } from "react";
import { getTechnicians } from "../data/dataCore"; // ดึงข้อมูลช่าง

const theme = {
    primary: "#18181b",
    primaryHover: "#27272a",
    secondary: "#f3f4f6",
    textDark: "#111827",
    textLight: "#4b5563",
    bg: "#f4f4f5",
    white: "#FFFFFF",
    shadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
    radius: "8px",
};

export default function LeaderReport() {
    const [selectedJob, setSelectedJob] = useState(null);
    const [reports, setReports] = useState([]);
    const [detail, setDetail] = useState("");
    const [note, setNote] = useState("");

    const technicians = getTechnicians(); 

    
    const jobs = technicians.map(t => ({
        id: t.id,
        namework: t.job || "งานทั่วไป",
        typework: t.typework,
        role: t.phone || "-",
        datework: new Date().toLocaleDateString("th-TH"),
        time: "09:00 - 17:00",
        detail: "รายละเอียดงานของช่าง " + t.name,
        completed: false,
    }));

    const handleSend = () => {
        if (!detail) return alert("กรุณากรอกรายละเอียดงาน");
        const newReport = {
            jobId: selectedJob.id,
            title: selectedJob.namework,
            location: selectedJob.role,
            detail,
            note,
            date: new Date().toLocaleString("th-TH"),
        };
        setReports([newReport, ...reports]);
        setSelectedJob(null);
        setDetail("");
        setNote("");
    };

    const styles = {
        container: { width: "100%", minHeight: "100vh", padding: "2rem", backgroundColor: theme.bg, fontFamily: "'Prompt', sans-serif" },
        card: { background: theme.white, borderRadius: theme.radius, padding: "2rem", boxShadow: theme.shadow, marginBottom: "2rem", border: "1px solid #EAEAEA" },
        table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 0.8rem" },
        th: { textAlign: "left", color: theme.textLight, fontWeight: "600", padding: "1rem", borderBottom: `2px solid ${theme.secondary}` },
        td: { background: theme.white, padding: "1.2rem 1rem", color: theme.textDark, borderTop: `1px solid ${theme.secondary}`, borderBottom: `1px solid ${theme.secondary}` },
        actionBtn: { padding: "8px 20px", background: theme.primary, color: "white", border: "none", borderRadius: "30px", cursor: "pointer", fontWeight: "bold" },
        backBtn: { background: "transparent", border: "none", fontSize: "1.2rem", color: theme.textLight, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" },
        textarea: { width: "100%", minHeight: "120px", background: "#FAFAFA", border: "1px solid #E1E1E1", borderRadius: "12px", padding: "1rem", fontSize: "1rem", color: theme.textDark, outline: "none", resize: "vertical", marginBottom: "1.5rem" },
        sendBtn: { width: "100%", padding: "14px", background: theme.primary, color: "white", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" },
        historyItem: { padding: "1.5rem", background: "#FFFFFF", borderRadius: "12px", marginBottom: "1rem", borderLeft: `5px solid ${theme.primary}`, boxShadow: "0 2px 5px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" },
    };

    return (
        <div style={styles.container}>
            {!selectedJob && (
                <div style={{ maxWidth: "75%",marginLeft:"20rem" }}>
                    <h1 style={{ color: theme.textDark }}>รายงานปัญหา / การทำงาน</h1>
                    <div style={styles.card}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>ชื่องาน</th>
                                    <th style={styles.th}>ประเภทงาน</th>
                                    <th style={styles.th}>สถานที่</th>
                                    <th style={styles.th}>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job.id}>
                                        <td style={styles.td}>{job.id}</td>
                                        <td style={styles.td}>{job.namework}</td>
                                        <td style={styles.td}>{job.typework}</td>
                                        <td style={styles.td}>{job.role}</td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.actionBtn}
                                                onClick={() => { setSelectedJob(job); setDetail(job.detail); }}
                                            >
                                                รายงาน
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {reports.length > 0 && reports.map((r, i) => (
                        <div key={i} style={styles.historyItem}>
                            <div>
                                <div style={{ fontWeight: "bold" }}>{r.title}</div>
                                <div>📍 {r.location}</div>
                                <div>{r.detail}</div>
                            </div>
                            <div>{r.date}</div>
                        </div>
                    ))}
                </div>
            )}
            {selectedJob && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <button onClick={() => setSelectedJob(null)} style={styles.backBtn}><i class="bi bi-arrow-left" style={{fontSize:"30px"}}></i> ย้อนกลับ</button>
                    <div style={styles.card}>
                        <h2>{selectedJob.namework}</h2>
                        <p>📍 {selectedJob.role}</p>
                        <textarea style={styles.textarea} value={detail} onChange={e => setDetail(e.target.value)} />
                        <textarea style={{ ...styles.textarea, minHeight: "80px" }} value={note} onChange={e => setNote(e.target.value)} />
                        <button style={styles.sendBtn} onClick={handleSend}>ส่งรายงาน</button>
                    </div>
                </div>
            )}
        </div>
    );
}