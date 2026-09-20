import React from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const DocumentViewerModal = ({ document, onClose }) => {
  if (!document) return null;

  const isPdf = document.fileType === 'pdf' || (document.fileUrl && document.fileUrl.toLowerCase().includes('.pdf'));

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white m-0">{document.documentType}</h3>
                {document.status === 'verified' && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
                {document.status === 'pending' && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                    <Clock className="w-3 h-3" /> Pending Verification
                  </span>
                )}
                {document.status === 'rejected' && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-500/30">
                    <AlertTriangle className="w-3-3" /> Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono m-0 mt-0.5">
                {document.fileName}
              </p>
              {(document.memberId?.name || document.memberName) && (
                <p className="text-[11px] text-blue-300 m-0 mt-1">
                  Member: {document.memberId?.name || document.memberName}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Preview */}
        <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <div className="w-full h-full min-h-[500px] bg-white rounded-lg shadow overflow-hidden">
              <iframe
                src={document.fileUrl}
                title={document.fileName}
                className="w-full h-[500px] border-none"
              />
            </div>
          ) : (
            <div className="max-w-full max-h-[550px] flex items-center justify-center">
              <img
                src={document.fileUrl}
                alt={document.fileName}
                className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-md border border-slate-200"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Uploaded: <strong>{new Date(document.uploadedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            {document.rejectionReason && (
              <span className="block text-red-600 font-medium mt-0.5">
                Rejection Reason: {document.rejectionReason}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Full Document
            </a>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
