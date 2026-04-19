import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Upload, Send, MapPin, Clock, FileText, Camera, CheckCircle, Download, Package, PenLine, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_BASE = 'http://localhost:3000';

const JobPostingForm = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const workData  = location.state?.work;

  const getSession = () => JSON.parse(localStorage.getItem('session'))?.user || null;

  const [formData, setFormData] = useState({
    startDate : '',
    issues    : '',
  });

  // ── หัวหน้างาน ───────────────────────────────────────────────────────────────
  const [supervisor, setSupervisor] = useState(null);

  // ── วัสดุ ────────────────────────────────────────────────────────────────────
  const [materials, setMaterials]         = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [matLoading, setMatLoading]       = useState(false);

  // ── รูปภาพ ───────────────────────────────────────────────────────────────────
  const [imageFiles, setImageFiles]       = useState({ beforeImage: null, afterImage: null });
  const [imagePreviews, setImagePreviews] = useState({ beforeImage: null, afterImage: null });

  // ── ลายเซ็น Canvas ───────────────────────────────────────────────────────────
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing]         = useState(false);
  const [hasSignature, setHasSignature]   = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const lastPos = useRef({ x: 0, y: 0 });

  const [currentStep, setCurrentStep]   = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ══════════════════════════════════════════════════════════════════════════════
  // Init
  // ══════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!workData) {
      alert('ไม่พบข้อมูลงาน กรุณาเลือกงานจากปฏิทิน');
      navigate('/calendar');
      return;
    }
    fetchMaterials();
    fetchSupervisor();
    if (workData.work_note) {
      setFormData(prev => ({ ...prev, issues: workData.work_note }));
    }
  }, [workData, navigate]);

  // ── ดึงข้อมูลหัวหน้าของช่างคนนี้ ─────────────────────────────────────────────
  const fetchSupervisor = async () => {
    const session = getSession();
    const userId  = session?.id || session?.user_id;
    if (!userId) return;
    try {
      // ลองดึงจาก work ก่อน (work มี supervisor_id)
      if (workData?.supervisor_id) {
        const res  = await fetch(`${API_BASE}/api/users/${workData.supervisor_id}`);
        const data = await res.json();
        if (data?.user) { setSupervisor(data.user); return; }
      }
      // fallback: ดึงจาก getMySupervisor
      const res  = await fetch(`${API_BASE}/api/users/${userId}/supervisor`);
      const data = await res.json();
      if (data?.supervisor) setSupervisor(data.supervisor);
    } catch (err) {
      console.error('fetchSupervisor error:', err);
    }
  };

  const fetchMaterials = async () => {
    setMatLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/materials`);
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchMaterials error:', err);
    } finally {
      setMatLoading(false);
    }
  };

  // ── วัสดุ ────────────────────────────────────────────────────────────────────
  const addMaterialItem = () =>
    setSelectedItems(prev => [...prev, { material_id: '', name: '', unit: '', qty: 1 }]);

  const removeMaterialItem = (idx) =>
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));

  const handleMaterialChange = (idx, field, value) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      if (field === 'material_id') {
        const found = materials.find(m => String(m.material_id) === String(value));
        updated[idx] = { ...updated[idx], material_id: value, name: found?.name || '', unit: found?.unit || '' };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  const getMaterialsUsedString = () =>
    selectedItems.filter(i => i.name && i.qty > 0).map(i => `${i.name} x${i.qty} ${i.unit}`).join(', ');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFiles(prev    => ({ ...prev, [field]: file }));
    setImagePreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ลายเซ็น Canvas — รองรับทั้ง Mouse และ Touch
  // ══════════════════════════════════════════════════════════════════════════════
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    // รองรับ touch
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    setIsDrawing(true);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();

    lastPos.current = pos;
    setHasSignature(true);
  }, [isDrawing]);

  const stopDrawing = useCallback((e) => {
    e?.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    // บันทึก dataUrl ทันทีเมื่อหยุดวาด
    const canvas = signatureCanvasRef.current;
    if (canvas) setSignatureDataUrl(canvas.toDataURL('image/png'));
  }, [isDrawing]);

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setSignatureDataUrl(null);
  };

  // แปลง Canvas dataUrl → File object เพื่อส่ง FormData
  const signatureToFile = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !hasSignature) return null;
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) { resolve(null); return; }
        const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // handleSubmit — แก้บั๊ก 500 + รองรับลายเซ็น
  // ══════════════════════════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    const session = getSession();
    const workId  = workData?.work_id || workData?.id;
    const userId  = session?.id || session?.user_id;

    
    if (!workId || !userId) {
      alert('ไม่พบข้อมูลงานหรือผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    // ตรวจว่ามีลายเซ็น
    if (!hasSignature) {
      alert('⚠️ กรุณาลงลายเซ็นก่อนส่งงาน');
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      // ── Step 1: อัปเดตสถานะ + บันทึก work_report ─────────────────────────────
      const statusRes = await fetch(
        `${API_BASE}/api/works/${workId}/assign/${userId}/status`,
        {
          method : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            status        : 'PendingInspection',
            work_note     : formData.issues,
            materials_used: getMaterialsUsedString(),
            finish_time   : formData.startDate,
          }),
        }
      );

      if (!statusRes.ok) {
        const err = await statusRes.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${statusRes.status}`);
      }

      // ── Step 2: อัปโหลดรูปภาพ + ลายเซ็น ──────────────────────────────────────
      const sigFile = await signatureToFile();
      const hasImages = Object.values(imageFiles).some(f => f !== null) || sigFile;

      if (hasImages) {
        const form = new FormData();
        if (imageFiles.beforeImage) form.append('before_image', imageFiles.beforeImage);
        if (imageFiles.afterImage)  form.append('after_image',  imageFiles.afterImage);
        if (sigFile)                form.append('other_image',  sigFile);  // ลายเซ็นเก็บใน other_image

        const imgRes = await fetch(`${API_BASE}/api/works/${workId}/report-images`, {
          method: 'POST',
          body  : form,
        });

        if (!imgRes.ok) {
          console.warn('อัปโหลดรูปไม่สำเร็จ แต่บันทึกงานผ่านแล้ว');
        }
      }

      const supName = supervisor?.name || supervisor?.supervisor_name || 'หัวหน้างาน';
      alert(`✅ ส่งงานเรียบร้อย!\nข้อมูลถูกส่งไปยัง ${supName} เพื่อตรวจสอบแล้ว`);
      navigate('/worksheet');
    } catch (error) {
      console.error('handleSubmit error:', error);
      alert(`❌ ส่งงานไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────────
  const downloadPDF = () => {
    const input = document.getElementById('report-summary');
    if (!input) return;

    // วัดความสูงจริงของ content (ไม่เกิน scrollHeight)
    const originalHeight = input.style.height;
    input.style.height = 'auto';

    html2canvas(input, {
      scale          : 2,
      useCORS        : true,
      backgroundColor: '#ffffff',
      scrollY        : 0,
      windowWidth    : input.scrollWidth,
      height         : input.scrollHeight,   // ✅ capture เฉพาะส่วนที่มี content
    })
      .then(canvas => {
        input.style.height = originalHeight;

        const pdf      = new jsPDF('p', 'mm', 'a4');
        const pdfW     = pdf.internal.pageSize.getWidth();   // 210 mm
        const pdfPageH = pdf.internal.pageSize.getHeight();  // 297 mm
        const margin   = 10; // mm

        const contentW  = pdfW - margin * 2;
        const imgH      = (canvas.height * contentW) / canvas.width; // ความสูงทั้งหมดใน mm

        let yOffset = 0; // ตำแหน่งที่ยังไม่ได้ print (px บน canvas)
        let page    = 0;

        const pageHeightPx = (pdfPageH - margin * 2) * (canvas.width / contentW); // px ต่อหน้า

        while (yOffset < canvas.height) {
          if (page > 0) pdf.addPage();

          // Crop canvas เฉพาะส่วนของหน้านี้
          const sliceH  = Math.min(pageHeightPx, canvas.height - yOffset);
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width  = canvas.width;
          tmpCanvas.height = sliceH;
          const ctx = tmpCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

          const sliceImgH = (sliceH * contentW) / canvas.width;
          pdf.addImage(tmpCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentW, sliceImgH);

          yOffset += pageHeightPx;
          page++;
        }

        pdf.save(`JobReport-${workData?.work_id || workData?.id}.pdf`);
      })
      .catch(err => {
        alert('สร้าง PDF ไม่สำเร็จ: ' + err.message);
      });
  };

  if (!workData) return null;

  const getWorkId       = (w) => w.work_id || w.id || '';
  const getWorkName     = (w) => w.job_name || w.namework || '-';
  const getWorkType     = (w) => w.job_type || w.typework || '-';
  const getWorkDetail   = (w) => w.job_detail || w.detail || '-';
  const getWorkLocation = (w) => w.location || '-';
  const getTechName     = (w) => {
    const session = getSession();
    return w.technician_name || w.technicianName || session?.name || '-';
  };

  const steps = [
    { num: 1, label: 'ข้อมูลงาน',   icon: FileText    },
    { num: 2, label: 'วัสดุ/บันทึก', icon: Package     },
    { num: 3, label: 'หลักฐาน/เซ็น', icon: PenLine     },
    { num: 4, label: 'ส่งงาน/PDF',  icon: CheckCircle },
  ];

  return (
    <div className="w-100 overflow-auto" style={{ marginLeft: '14rem' }}>
      {/* Header */}
      <div className="p-3">
        <button onClick={() => navigate(-1)} className="btn btn-primary mb-2">← ย้อนกลับ</button>
        <h1 className="fw-bold p-2">รายงานผลงาน: {getWorkName(workData)}</h1>

        {/* แสดง leader_comment ถ้าถูกส่งกลับ */}
        {workData.leader_comment && (
          <div className="alert alert-danger mx-3">
            <strong>💬 ความเห็นหัวหน้า:</strong> {workData.leader_comment}
          </div>
        )}

        {/* แสดงข้อมูลหัวหน้าที่จะรับงาน */}
        {supervisor && (
          <div className="alert alert-info mx-3 d-flex align-items-center gap-3">
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <div>
              <strong>ส่งงานไปยังหัวหน้า:</strong>{' '}
              <span className="fw-bold text-primary">
                {supervisor.name || supervisor.supervisor_name}
              </span>
              {(supervisor.phone || supervisor.supervisor_phone) && (
                <span className="text-muted ms-2 small">
                  📞 {supervisor.phone || supervisor.supervisor_phone}
                </span>
              )}
              {(supervisor.department || supervisor.supervisor_department) && (
                <span className="badge bg-secondary ms-2">
                  {supervisor.department || supervisor.supervisor_department}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep >= step.num
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : 'bg-gray-100 text-gray-400'
                  }`}>{step.num}</div>
                  <span className={`mt-2 text-sm font-medium ${currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Step 1: ข้อมูลงาน ── */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 pb-4 border-b">
                <FileText size={28} className="text-blue-600" /> ข้อมูลงาน
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="ชื่องาน"        value={getWorkName(workData)}     icon="🔧" />
                <InfoRow label="ประเภทงาน"       value={getWorkType(workData)}     icon="📋" />
                <InfoRow label="สถานที่"          value={getWorkLocation(workData)} icon="📍" />
                <InfoRow label="ช่างผู้ปฏิบัติ"  value={getTechName(workData)}     icon="👤" />
                {supervisor && (
                  <InfoRow
                    label="หัวหน้างาน"
                    value={supervisor.name || supervisor.supervisor_name || '-'}
                    icon="🧑‍💼"
                  />
                )}
              </div>
              {getWorkDetail(workData) !== '-' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-700 mb-1">รายละเอียดงาน</p>
                  <p className="text-gray-700">{getWorkDetail(workData)}</p>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(2)}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg">
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: วัสดุ + บันทึกผล ── */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 pb-4 border-b">
                <Package size={28} className="text-blue-600" /> วัสดุที่ใช้และบันทึกผล
              </h2>

              {/* วัสดุ */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-base font-bold text-gray-700">🔩 วัสดุที่ใช้ในงาน</label>
                  <button type="button" onClick={addMaterialItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    + เพิ่มวัสดุ
                  </button>
                </div>
                {matLoading ? (
                  <div className="text-center py-3 text-muted">
                    <span className="spinner-border spinner-border-sm me-2" />กำลังโหลดวัสดุ...
                  </div>
                ) : selectedItems.length === 0 ? (
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-400 text-sm">
                    กดปุ่ม <strong>"+ เพิ่มวัสดุ"</strong> เพื่อเลือกวัสดุที่ใช้
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center p-2 bg-gray-50 rounded-xl border">
                        <select className="form-select form-select-sm flex-1" value={item.material_id}
                          onChange={e => handleMaterialChange(idx, 'material_id', e.target.value)}>
                          <option value="">-- เลือกวัสดุ --</option>
                          {materials.map(m => (
                            <option key={m.material_id} value={m.material_id}>
                              {m.name} (คงเหลือ: {m.quantity} {m.unit})
                            </option>
                          ))}
                        </select>
                        <input type="number" min="1" className="form-control form-control-sm"
                          style={{ width: '80px' }} value={item.qty}
                          onChange={e => handleMaterialChange(idx, 'qty', Number(e.target.value))} />
                        <span className="text-sm text-gray-500 min-w-[40px]">{item.unit}</span>
                        <button type="button" onClick={() => removeMaterialItem(idx)}
                          className="btn btn-sm btn-outline-danger">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* เวลา */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">🕐 เวลาเริ่ม / เสร็จงาน</label>
                <input type="text" name="startDate" value={formData.startDate} onChange={handleInputChange}
                  placeholder="เช่น 09:00 - 11:30"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all text-base" />
              </div>

              {/* ปัญหา */}
              <div>
                <label className="block text-base font-bold text-gray-700 mb-2">📝 ปัญหาที่พบ / ข้อเสนอแนะ</label>
                <textarea name="issues" value={formData.issues} onChange={handleInputChange} rows={3}
                  placeholder="บันทึกปัญหาที่พบ หรือข้อเสนอแนะในการทำงาน"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-all text-base resize-none" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(1)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg">← ย้อนกลับ</button>
              <button
                onClick={() => {
                  if (!formData.issues || !formData.issues.trim()) {
                    alert('⚠️ กรุณากรอกปัญหาที่พบ / ข้อเสนอแนะก่อนไปขั้นตอนถัดไป');
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg">ถัดไป →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: รูปภาพ + ลายเซ็นจริง ── */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 pb-4 border-b">
                <Camera size={28} className="text-blue-600" /> หลักฐานการปฏิบัติงาน
              </h2>

              {/* รูปก่อน/หลัง */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { field: 'beforeImage', label: '📷 รูปก่อนดำเนินการ' },
                  { field: 'afterImage',  label: '📷 รูปหลังดำเนินการ' },
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-3">
                    <label className="block text-base font-bold text-gray-700">{label}</label>
                    <div className="relative group">
                      <input type="file" accept="image/*" onChange={handleImageUpload(field)} className="hidden" id={field} />
                      <label htmlFor={field}
                        className={`block w-full h-48 rounded-xl cursor-pointer flex flex-col items-center justify-center border-2 border-dashed overflow-hidden ${
                          imagePreviews[field] ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }`}>
                        {imagePreviews[field] ? (
                          <img src={imagePreviews[field]} alt={field} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload size={40} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 text-center px-4">แตะเพื่ออัพโหลดรูปภาพ</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✏️ ลายเซ็นจริง */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-base font-bold text-gray-700 flex items-center gap-2">
                    <PenLine size={20} className="text-blue-600" />
                    ลายเซ็นลูกค้า / ผู้รับงาน <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={clearSignature}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition">
                    <Trash2 size={14} /> ล้างลายเซ็น
                  </button>
                </div>

                <div className="relative">
                  <canvas
                    ref={signatureCanvasRef}
                    width={700}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      width: '100%',
                      height: '200px',
                      border: hasSignature ? '2px solid #22c55e' : '2px dashed #93c5fd',
                      borderRadius: '12px',
                      backgroundColor: '#fafafa',
                      cursor: 'crosshair',
                      touchAction: 'none',   // สำคัญ! ป้องกัน scroll ขณะวาดบน touch
                    }}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <PenLine size={36} className="text-blue-300 mb-2" />
                      <span className="text-blue-400 text-sm font-medium">วาดลายเซ็นในกรอบนี้</span>
                      <span className="text-gray-400 text-xs mt-1">รองรับทั้งเมาส์และหน้าจอสัมผัส</span>
                    </div>
                  )}
                </div>

                {hasSignature && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle size={16} /> ลงลายเซ็นแล้ว ✓
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(2)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg">← ย้อนกลับ</button>
              <button
                onClick={() => {
                  if (!hasSignature) { alert('⚠️ กรุณาลงลายเซ็นก่อนไปขั้นตอนถัดไป'); return; }
                  setCurrentStep(4);
                }}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg">
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: ตรวจสอบและส่ง ── */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <CheckCircle size={28} className="text-green-600" /> ตรวจสอบข้อมูลก่อนส่ง
                </h2>
                <button onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  <Download size={18} /> Download PDF
                </button>
              </div>

              {/* ส่วนที่ capture เป็น PDF */}
              <div id="report-summary" className="space-y-4 p-6 rounded-xl border"
                style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', color: '#111827' }}>

                <div className="text-center mb-6 pb-4 border-b" style={{ borderColor: '#D1D5DB' }}>
                  <h3 className="text-xl font-bold">ใบรายงานการปฏิบัติงาน</h3>
                  <p style={{ color: '#6B7280' }}>รหัสงาน: JOB-{getWorkId(workData)}</p>
                  <p style={{ color: '#6B7280' }}>วันที่: {new Date().toLocaleDateString('th-TH')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <SummaryItem label="ชื่องาน"         value={getWorkName(workData)}     />
                  <SummaryItem label="สถานที่"          value={getWorkLocation(workData)} />
                  <SummaryItem label="ช่างผู้ปฏิบัติ"  value={getTechName(workData)}     />
                  <SummaryItem label="เวลาเริ่ม/เสร็จ" value={formData.startDate || '-'} />
                  {supervisor && (
                    <SummaryItem
                      label="ส่งงานให้หัวหน้า"
                      value={supervisor.name || supervisor.supervisor_name || '-'}
                    />
                  )}
                </div>

                <hr style={{ borderColor: '#E5E7EB' }} />
                <SummaryItem label="วัสดุที่ใช้"        value={getMaterialsUsedString() || '-'} />
                <SummaryItem label="ปัญหา/ข้อเสนอแนะ"  value={formData.issues || '-'} />

                {workData.leader_comment && (
                  <SummaryItem label="ความเห็นหัวหน้า (ครั้งก่อน)" value={workData.leader_comment} />
                )}

                {/* รูปภาพ + ลายเซ็น */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <ImagePreview label="ก่อนดำเนินการ" src={imagePreviews.beforeImage} />
                  <ImagePreview label="หลังดำเนินการ"  src={imagePreviews.afterImage}  />
                  {/* ลายเซ็น: render จาก canvas dataUrl */}
                  <div>
                    <div className="text-xs mb-2 font-medium" style={{ color: '#4B5563' }}>
                      ลายเซ็นลูกค้า / ผู้รับงาน
                    </div>
                    <div className="w-full h-32 rounded-lg overflow-hidden border flex items-center justify-center"
                      style={{ backgroundColor: '#F9FAFB' }}>
                      {signatureDataUrl ? (
                        <img src={signatureDataUrl} alt="signature" className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-xs text-gray-400">ยังไม่มีลายเซ็น</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCurrentStep(3)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg">← ย้อนกลับ</button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {isSubmitting
                  ? <><span className="spinner-border spinner-border-sm me-2" />กำลังส่ง...</>
                  : <><Send size={24} /> ยืนยันส่งงาน</>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <span className="text-gray-600 font-medium flex items-center gap-2">
      <span className="text-xl">{icon}</span>{label}
    </span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div className="pb-3 border-b last:border-b-0" style={{ borderColor: '#E5E7EB' }}>
    <div className="text-sm mb-1" style={{ color: '#4B5563' }}>{label}</div>
    <div className="font-semibold break-words" style={{ color: '#111827' }}>{value}</div>
  </div>
);

const ImagePreview = ({ label, src }) => (
  <div>
    <div className="text-xs mb-2 font-medium" style={{ color: '#4B5563' }}>{label}</div>
    <div className="w-full h-32 rounded-lg overflow-hidden border" style={{ backgroundColor: '#E5E7EB' }}>
      {src
        ? <img src={src} alt={label} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center" style={{ color: '#9CA3AF' }}>
            <span className="text-xs">ไม่มีรูปภาพ</span>
          </div>
      }
    </div>
  </div>
);

export default JobPostingForm;