import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  exportProductsToCsv,
  exportOrdersToCsv,
  exportSettingsToCsv,
  exportNotificationsToCsv,
  parseProductsCsv,
  parseSettingsCsv,
  parseNotificationsCsv
} from '../../utils/csv';
import { Product, StoreSettings, SiteNotification, StoredBackupSnapshot, BackupAnalysisResult } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Clock,
  Database,
  Trash2,
  Sparkles,
  FileJson,
  ShoppingBag,
  Layers,
  Sliders,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export const AdminCsv: React.FC = () => {
  const {
    products,
    orders,
    settings,
    notifications,
    importProductsList,
    importSettingsFromCsv,
    importNotificationsFromCsv,
    getCompleteBackupData,
    restoreCompleteBackup,
    analyzeBackup,
    snapshots,
    createHourlySnapshot,
    restoreSnapshotById,
    deleteSnapshotById,
    exportSnapshotAsJson,
    setCurrentView
  } = useStore();

  const [activeTab, setActiveTab] = useState<'backup-restore' | 'history' | 'csv'>('backup-restore');

  // Snapshot creation state
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Restore state
  const [restoreText, setRestoreText] = useState('');
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<BackupAnalysisResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [justRestoredStats, setJustRestoredStats] = useState<{
    productsCount: number;
    ordersCount: number;
    settingsCount: number;
    storeName?: string;
  } | null>(null);

  // In-app modal confirmation for snapshot restoration (replaces blocking window.confirm)
  const [snapshotToRestore, setSnapshotToRestore] = useState<StoredBackupSnapshot | null>(null);

  // CSV Import state
  const [csvImportType, setCsvImportType] = useState<'products' | 'settings' | 'notifications'>('products');
  const [csvInput, setCsvInput] = useState('');
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const [previewSettings, setPreviewSettings] = useState<Partial<StoreSettings> | null>(null);
  const [previewNotifications, setPreviewNotifications] = useState<SiteNotification[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [replaceMode, setReplaceMode] = useState(false);

  // Global Feedback banner
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 7000);
  };

  // 1. Download complete JSON backup package
  const handleDownloadBackupJson = async () => {
    try {
      const { dataString } = await getCompleteBackupData();
      const blob = new Blob([dataString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
      const storeSlug = (settings.storeName || 'loja').toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.href = url;
      a.download = `backup_${storeSlug}_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showFeedback(
        'Arquivo de backup completo baixado com sucesso! Guarde este arquivo em segurança.',
        'success'
      );
    } catch (err: any) {
      showFeedback('Erro ao baixar backup: ' + err.message, 'error');
    }
  };

  // 2. Copy complete backup string
  const handleCopyCompleteBackup = async () => {
    try {
      const { dataString } = await getCompleteBackupData();
      await navigator.clipboard.writeText(dataString);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 3000);
      showFeedback('Backup completo copiado para a área de transferência!', 'success');
    } catch (err: any) {
      showFeedback('Erro ao copiar dados: ' + err.message, 'error');
    }
  };

  // 3. Create snapshot
  const handleCreateSnapshot = async () => {
    setIsCreatingSnapshot(true);
    try {
      const snap = await createHourlySnapshot(snapshotLabel.trim() || undefined, 'manual');
      setSnapshotLabel('');
      showFeedback(
        `Ponto de restauração das ${snap.timeFormatted} salvo com sucesso! (${snap.productsCount} produtos, ${snap.ordersCount} pedidos).`,
        'success'
      );
    } catch (err: any) {
      showFeedback('Erro ao criar ponto de restauração: ' + err.message, 'error');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // 4. Analyze file or text input immediately
  const handleInspectText = async (text: string, pwd?: string) => {
    if (!text.trim()) {
      setAnalyzedData(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeBackup(text, pwd || restorePassword);
      setAnalyzedData(result);
    } catch {
      setAnalyzedData({
        isValid: false,
        productsCount: 0,
        ordersCount: 0,
        settingsCount: 0,
        notificationsCount: 0,
        hasProducts: false,
        hasSettings: false,
        hasOrders: false,
        hasNotifications: false,
        error: 'Não foi possível ler o arquivo. Certifique-se de que é um JSON válido.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file upload
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRestoreText(content);
        await handleInspectText(content);
      }
    };
    reader.readAsText(file);
    // Reset target value so the same file can be selected again if desired
    e.target.value = '';
  };

  // 5. Apply restore directly
  const handleApplyRestore = async () => {
    if (!restoreText.trim()) {
      showFeedback('Por favor, selecione um arquivo .json ou cole o conteúdo do backup.', 'error');
      return;
    }

    setIsRestoring(true);
    try {
      const res = await restoreCompleteBackup(restoreText, restorePassword.trim() || undefined);
      if (res.success) {
        setJustRestoredStats({
          productsCount: res.stats?.productsCount || 0,
          ordersCount: res.stats?.ordersCount || 0,
          settingsCount: res.stats?.settingsCount || 0,
          storeName: analyzedData?.storeName
        });
        showFeedback(
          `✅ Restauração concluída! ${res.stats?.productsCount || 0} produtos e configurações gravados com persistência permanente no navegador.`,
          'success'
        );
        setRestoreText('');
        setRestoreFileName('');
        setAnalyzedData(null);
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback('Erro ao restaurar: ' + err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // 6. Confirm restore snapshot
  const handleConfirmSnapshotRestore = async () => {
    if (!snapshotToRestore) return;
    setIsRestoring(true);
    try {
      const res = await restoreSnapshotById(snapshotToRestore.id);
      if (res.success) {
        showFeedback(
          `Backup de "${snapshotToRestore.dateFormatted} às ${snapshotToRestore.timeFormatted}" restaurado e salvo com sucesso!`,
          'success'
        );
        setSnapshotToRestore(null);
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback('Erro ao restaurar snapshot: ' + err.message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // CSV parsing
  const handleCsvInputChange = (text: string, type: 'products' | 'settings' | 'notifications') => {
    setCsvInput(text);
    setImportErrors([]);

    if (!text.trim()) {
      setPreviewProducts([]);
      setPreviewSettings(null);
      setPreviewNotifications([]);
      return;
    }

    if (type === 'products') {
      const { products: parsed, errors } = parseProductsCsv(text);
      setPreviewProducts(parsed);
      setImportErrors(errors);
    } else if (type === 'settings') {
      const { settings: parsed, count } = parseSettingsCsv(text);
      if (count === 0) {
        setImportErrors(['Nenhum parâmetro de configuração válido identificado no CSV.']);
        setPreviewSettings(null);
      } else {
        setPreviewSettings(parsed);
      }
    } else if (type === 'notifications') {
      const { notifications: parsed, count } = parseNotificationsCsv(text);
      if (count === 0) {
        setImportErrors(['Nenhum comunicado identificado no CSV.']);
        setPreviewNotifications([]);
      } else {
        setPreviewNotifications(parsed);
      }
    }
  };

  const handleConfirmCsvImport = () => {
    if (csvImportType === 'products' && previewProducts.length > 0) {
      importProductsList(previewProducts, replaceMode);
      showFeedback(`Sucesso! ${previewProducts.length} produtos foram importados.`, 'success');
      setCsvInput('');
      setPreviewProducts([]);
    } else if (csvImportType === 'settings' && previewSettings) {
      importSettingsFromCsv(previewSettings);
      showFeedback(
        `Sucesso! ${Object.keys(previewSettings).length} configurações foram atualizadas.`,
        'success'
      );
      setCsvInput('');
      setPreviewSettings(null);
    } else if (csvImportType === 'notifications' && previewNotifications.length > 0) {
      importNotificationsFromCsv(previewNotifications, replaceMode);
      showFeedback(`Sucesso! ${previewNotifications.length} comunicados foram importados.`, 'success');
      setCsvInput('');
      setPreviewNotifications([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner - Clean, informative and high contrast */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Persistência Permanente Garantida</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Backup, Restauração & Dados
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              Exporte todo o conteúdo da sua loja em um arquivo <strong>.JSON</strong> completo ou restaure produtos e configurações a qualquer momento. Suas alterações são gravadas com garantia de permanência mesmo após recarregar o navegador.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 text-xs shrink-0">
            <div className="text-center px-3 border-r border-neutral-200">
              <span className="block text-base font-extrabold text-neutral-900">{products.length}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Produtos</span>
            </div>
            <div className="text-center px-3 border-r border-neutral-200">
              <span className="block text-base font-extrabold text-neutral-900">{orders.length}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Pedidos</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-base font-extrabold text-emerald-700 font-mono">100%</span>
              <span className="text-[10px] text-neutral-500 font-medium">Salvo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-neutral-900 border-neutral-900 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Post-Restore Verification Card */}
      {justRestoredStats && (
        <div className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                Backup Aplicado com Sucesso!
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              Foram restaurados e gravados permanentemente: <strong>{justRestoredStats.productsCount} produtos</strong>, <strong>{justRestoredStats.ordersCount} pedidos</strong> e <strong>{justRestoredStats.settingsCount} configurações</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('catalog')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver Catálogo</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Testar recarregar a página para comprovar a persistência"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-600" />
              <span>Testar Recarregar (F5)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modern Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/60">
        <button
          onClick={() => setActiveTab('backup-restore')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'backup-restore'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backup & Restauração (.JSON)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pontos Salvos no Navegador</span>
          {snapshots.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-800 text-white font-bold">
              {snapshots.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('csv')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'csv'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Planilhas Excel / CSV</span>
        </button>
      </div>

      {/* ================= TAB 1: BACKUP & RESTAURAÇÃO (.JSON) ================= */}
      {activeTab === 'backup-restore' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: EXPORTAR BACKUP */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">
                  1. Exportar Cópia de Segurança
                </h3>
                <p className="text-xs text-neutral-500">
                  Gere um arquivo .json seguro com todos os dados da sua loja.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3 text-xs">
              <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
                Resumo dos dados incluídos na cópia:
              </span>
              <ul className="space-y-2 text-neutral-600 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{products.length} Produtos</strong> com fotos, tamanhos, especificações e estoques</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{orders.length} Pedidos</strong> registrados com histórico completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Configurações da Loja</strong> (Nome: "{settings.storeName}", WhatsApp, Instagram, Frete, Endereço e Textos)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{notifications.length} Comunicados e Avisos</strong></span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadBackupJson}
                className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Baixar Backup Completo (.JSON)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyCompleteBackup}
                  className="flex-1 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedBackup ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copiar Texto JSON</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCreateSnapshot}
                  disabled={isCreatingSnapshot}
                  className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isCreatingSnapshot ? 'animate-spin' : ''}`} />
                  <span>Salvar Ponto Local</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: RESTAURAR BACKUP - REFINED, CRYSTAL CLEAR & INSTANT FEEDBACK */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">
                  2. Restaurar Backup (.JSON)
                </h3>
                <p className="text-xs text-neutral-500">
                  Carregue um arquivo .json para recuperar seus produtos e dados.
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/70 hover:bg-neutral-50 rounded-2xl cursor-pointer transition-all group">
                <FileJson className="w-10 h-10 text-neutral-400 group-hover:text-neutral-900 transition-colors mb-2" />
                <span className="text-xs font-bold text-neutral-900">
                  {restoreFileName ? restoreFileName : 'Clique para selecionar seu arquivo .JSON'}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5">
                  {restoreFileName ? 'Arquivo carregado. Confira o resumo abaixo para aplicar.' : 'Ou arraste e solte o arquivo aqui'}
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option to paste JSON directly */}
            <div>
              <details className="text-xs group">
                <summary className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer list-none flex items-center gap-1 select-none">
                  <span>▸ Ou cole o código JSON diretamente</span>
                </summary>
                <textarea
                  rows={4}
                  value={restoreText}
                  onChange={(e) => {
                    setRestoreText(e.target.value);
                    setRestoreFileName('');
                    handleInspectText(e.target.value);
                  }}
                  placeholder='{"products": [...], "settings": {...}}'
                  className="w-full mt-2 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 font-mono text-[11px] text-neutral-800"
                />
              </details>
            </div>

            {/* Live Analyzed Content Box */}
            {isAnalyzing && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-600" />
                <span>Analisando conteúdo do arquivo...</span>
              </div>
            )}

            {analyzedData && !isAnalyzing && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-3 ${
                  analyzedData.isValid
                    ? 'bg-emerald-50/80 border-emerald-200 text-neutral-800'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {analyzedData.isValid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Arquivo de Backup Válido e Verificado</span>
                      </div>
                      {analyzedData.version && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                          v{analyzedData.version}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                        <span className="block text-base font-extrabold text-neutral-900">
                          {analyzedData.productsCount}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">Produtos</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                        <span className="block text-base font-extrabold text-neutral-900">
                          {analyzedData.ordersCount}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">Pedidos</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                        <span className="block text-base font-extrabold text-neutral-900">
                          {analyzedData.settingsCount}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">Configs</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/80 border border-emerald-100">
                        <span className="block text-base font-extrabold text-neutral-900">
                          {analyzedData.notificationsCount}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium">Avisos</span>
                      </div>
                    </div>

                    {analyzedData.storeName && (
                      <div className="text-[11px] text-neutral-600">
                        Loja identificada: <strong>{analyzedData.storeName}</strong>
                      </div>
                    )}

                    {/* Password input if encrypted */}
                    {analyzedData.error?.includes('senha') && (
                      <div className="space-y-1.5 pt-2">
                        <label className="text-[11px] font-bold text-neutral-700 block">
                          Senha de Descriptografia:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={restorePassword}
                            onChange={(e) => setRestorePassword(e.target.value)}
                            placeholder="Digite a senha deste backup..."
                            className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-300 bg-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleInspectText(restoreText, restorePassword)}
                            className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
                          >
                            Verificar
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleApplyRestore}
                        disabled={isRestoring}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{isRestoring ? 'Gravando e Restaurando...' : 'Restaurar e Aplicar Agora'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRestoreText('');
                          setRestoreFileName('');
                          setAnalyzedData(null);
                        }}
                        className="py-3 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Não foi possível processar este arquivo</span>
                    </div>
                    <p className="text-[11px] text-rose-700">{analyzedData.error}</p>
                  </div>
                )}
              </div>
            )}

            {!analyzedData && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-600 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Garantia de Persistência Permanente:</strong> Ao aplicar o backup, os dados são sincronizados em múltiplas chaves permanentes no navegador. Mesmo reiniciando o computador ou recarregando a página, seus produtos e configurações ficam intactos.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PONTOS SALVOS NO NAVEGADOR ================= */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-neutral-900 text-base">
                Pontos de Restauração Salvos ({snapshots.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Histórico local de versões salvas no seu navegador para voltar no tempo com 1 clique.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do ponto (opcional)..."
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50/50"
              />
              <button
                type="button"
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Criar Ponto Agora</span>
              </button>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-neutral-700">Nenhum ponto de restauração salvo ainda.</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Clique no botão acima para criar uma cópia de segurança instantânea.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-xs sm:text-sm">
                        {snap.label || `Backup de ${snap.dateFormatted}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold border border-neutral-200">
                        {snap.dateFormatted} às {snap.timeFormatted}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                      <span><strong>{snap.productsCount}</strong> produtos</span>
                      <span>•</span>
                      <span><strong>{snap.ordersCount}</strong> pedidos</span>
                      <span>•</span>
                      <span><strong>{snap.settingsCount}</strong> configurações</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setSnapshotToRestore(snap)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Restaurar este ponto imediatamente"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportSnapshotAsJson(snap.id)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="Baixar arquivo .json desta versão"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Baixar .JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSnapshotById(snap.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Excluir este ponto do histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* In-app Confirmation Modal for Snapshot Restore (replaces window.confirm) */}
      {snapshotToRestore && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-neutral-900 text-lg">
                Restaurar Ponto de Segurança?
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Você está restaurando o ponto <strong>"{snapshotToRestore.label}"</strong> criado em <strong>{snapshotToRestore.dateFormatted} às {snapshotToRestore.timeFormatted}</strong>.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div>• <strong>{snapshotToRestore.productsCount} produtos</strong> serão restaurados</div>
              <div>• <strong>{snapshotToRestore.ordersCount} pedidos</strong> salvos</div>
              <div>• Configurações da loja sincronizadas</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmSnapshotRestore}
                disabled={isRestoring}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isRestoring ? 'Restaurando...' : 'Confirmar Restauração'}
              </button>
              <button
                type="button"
                onClick={() => setSnapshotToRestore(null)}
                className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PLANILHAS EXCEL / CSV ================= */}
      {activeTab === 'csv' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="font-bold text-neutral-900 text-base">
              Exportação & Importação em Planilha (CSV)
            </h3>
            <p className="text-xs text-neutral-500">
              Manipule produtos, pedidos ou configurações diretamente no Excel ou Google Planilhas.
            </p>
          </div>

          {/* 3 Quick Export Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <ShoppingBag className="w-4 h-4 text-neutral-800" />
                  <span className="font-bold text-neutral-900 text-xs">Produtos ({products.length})</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Exporta preços, estoques, descrições e fotos para planilha.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportProductsToCsv(products)}
                className="mt-3 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar CSV Produtos</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers className="w-4 h-4 text-neutral-800" />
                  <span className="font-bold text-neutral-900 text-xs">Pedidos ({orders.length})</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Exporta histórico de vendas com totais e status de entrega.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportOrdersToCsv(orders)}
                className="mt-3 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar CSV Pedidos</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sliders className="w-4 h-4 text-neutral-800" />
                  <span className="font-bold text-neutral-900 text-xs">Configurações da Loja</span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Exporta todos os parâmetros da loja em chave e valor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportSettingsToCsv(settings)}
                className="mt-3 w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar CSV Configs</span>
              </button>
            </div>
          </div>

          {/* Import CSV Section */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Importar Planilha CSV
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCsvImportType('products')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    csvImportType === 'products'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Produtos
                </button>
                <button
                  type="button"
                  onClick={() => setCsvImportType('settings')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    csvImportType === 'settings'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Configurações
                </button>
                <button
                  type="button"
                  onClick={() => setCsvImportType('notifications')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    csvImportType === 'notifications'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Comunicados
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={csvInput}
              onChange={(e) => handleCsvInputChange(e.target.value, csvImportType)}
              placeholder="Cole os dados CSV aqui (com cabeçalhos na primeira linha)..."
              className="w-full p-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 font-mono text-xs text-neutral-800"
            />

            {importErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                {importErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {previewProducts.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>{previewProducts.length} produtos identificados e prontos para importar.</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={replaceMode}
                    onChange={(e) => setReplaceMode(e.target.checked)}
                    className="rounded-sm text-emerald-600"
                  />
                  <span>Substituir catálogo atual</span>
                </label>
              </div>
            )}

            {previewSettings && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>{Object.keys(previewSettings).length} parâmetros de configuração prontos para aplicar.</span>
              </div>
            )}

            {previewNotifications.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span>{previewNotifications.length} comunicados prontos para importar.</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleConfirmCsvImport}
                disabled={!csvInput.trim() || importErrors.length > 0}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirmar Importação de CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
