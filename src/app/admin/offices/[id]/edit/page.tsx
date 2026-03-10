'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../new/CreateOffice.module.css';

interface ImagePreview {
    file: File;
    previewUrl: string;
}

export default function EditOfficePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // Form fields
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [surface, setSurface] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [description, setDescription] = useState('');
    const [extractedDetails, setExtractedDetails] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [availability, setAvailability] = useState(true);

    // Initial URLs (to keep if not overwriting)
    const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
    const [initialPlanUrl, setInitialPlanUrl] = useState<string | null>(null);

    // New Image state
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New Plan state
    const [planFile, setPlanFile] = useState<File | null>(null);
    const [planPreview, setPlanPreview] = useState<string | null>(null);
    const planInputRef = useRef<HTMLInputElement>(null);
    const [isParsingPlan, setIsParsingPlan] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    // Fetch existing data
    useEffect(() => {
        const fetchOffice = async () => {
            try {
                const res = await fetch(`/api/offices/${id}`);
                if (!res.ok) throw new Error('Bureau introuvable');
                const data = await res.json();

                setTitle(data.title || '');
                setCity(data.city);
                setSurface(data.surface.toString());
                setBasePrice(data.basePrice.toString());
                setDescription(data.description || '');
                setExtractedDetails(data.extractedDetails || '');
                setAvailability(data.availability);

                if (data.imageUrls) {
                    try {
                        setInitialImageUrls(JSON.parse(data.imageUrls));
                    } catch { }
                }
                if (data.planUrl) {
                    setInitialPlanUrl(data.planUrl);
                }
            } catch (err: any) {
                setFeedback({ type: 'error', msg: err.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchOffice();
    }, [id]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handlePlanChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPlanFile(file);
            setPlanPreview(URL.createObjectURL(file));
        }
    };

    const removePlan = () => {
        setPlanFile(null);
        setPlanPreview(null);
    };

    const handleParsePlan = async () => {
        if (!planFile && !initialPlanUrl) return;
        setIsParsingPlan(true);
        setFeedback(null);
        try {
            // Need to upload the plan first if it's a new file (though we just parse it directly via Vision API if it's a file)
            // If it's an existing URL, we can't easily parse it with Gemini from URL without extra work, so we only parse new files.
            if (!planFile) {
                throw new Error("Veuillez sélectionner un NOUVEAU plan pour utiliser l'extraction IA.");
            }

            const formData = new FormData();
            formData.append('plan', planFile);

            const res = await fetch('/api/admin/parse-plan', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de l'analyse du plan");

            if (data.title) setTitle(data.title);
            if (data.surface) setSurface(data.surface.toString());
            if (data.basePrice) setBasePrice(data.basePrice.toString());
            if (data.description) setDescription(data.description);
            if (data.extractedDetails) setExtractedDetails(data.extractedDetails);
            if (data.city && !city) setCity(data.city);

            setFeedback({ type: 'success', msg: 'Plan analysé et données pré-remplies !' });
        } catch (err: any) {
            setFeedback({ type: 'error', msg: `Erreur IA : ${err.message}` });
        } finally {
            setIsParsingPlan(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!city && !surface) {
            setFeedback({ type: 'error', msg: 'Fournissez au moins la ville et la surface pour générer une description.' });
            return;
        }
        setIsGeneratingDesc(true);
        setFeedback(null);
        try {
            const res = await fetch('/api/admin/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, city, surface, basePrice, extraInfo }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDescription(data.description);
        } catch (err: any) {
            setFeedback({ type: 'error', msg: `Erreur IA : ${err.message}` });
        } finally {
            setIsGeneratingDesc(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city || !surface || !basePrice) {
            setFeedback({ type: 'error', msg: 'Ville, Surface et Prix de base sont obligatoires.' });
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            // 1. Upload new images if any, otherwise keep initial
            let imageUrls = initialImageUrls;
            if (imagePreviews.length > 0) {
                const formData = new FormData();
                imagePreviews.forEach(p => formData.append('files', p.file));
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    imageUrls = uploadData.urls;
                }
            }

            // 1.5 Upload new plan if any, otherwise keep initial
            let planUrl = initialPlanUrl;
            if (planFile) {
                const formData = new FormData();
                formData.append('files', planFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok && uploadData.urls.length > 0) {
                    planUrl = uploadData.urls[0];
                }
            }

            // 2. Update the office using PUT
            const res = await fetch(`/api/offices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    city,
                    surface: Number(surface),
                    basePrice: Number(basePrice),
                    description,
                    extractedDetails,
                    availability,
                    imageUrls: JSON.stringify(imageUrls),
                    planUrl,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur lors de la modification');
            }

            setFeedback({ type: 'success', msg: 'Annonce modifiée avec succès !' });
            setTimeout(() => router.push('/admin/offices'), 1500);
        } catch (err: any) {
            setFeedback({ type: 'error', msg: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Chargement du bureau...</div>;

    return (
        <div className="animate-fade-in">
            <div className={styles.pageHeader}>
                <div>
                    <h1 className="page-title">Modifier l'Annonce</h1>
                    <p className="page-subtitle">Modifiez les informations du bureau {title}.</p>
                </div>
                <Link href="/admin/offices" className="btn-secondary">← Retour</Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    {/* Left Column — Main Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Title & City */}
                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <h3>📍 Informations générales</h3>

                            <div className={styles.field}>
                                <label className={styles.label}>Titre de l'annonce</label>
                                <input
                                    className={styles.input}
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="ex. Bureau Lumineux — Centre de Paris"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Ville *</label>
                                    <input
                                        className={styles.input}
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                        placeholder="Paris"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Surface (m²) *</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={surface}
                                        onChange={e => setSurface(e.target.value)}
                                        placeholder="120"
                                        required
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Prix de base / mois (€) *</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={basePrice}
                                        onChange={e => setBasePrice(e.target.value)}
                                        placeholder="2500"
                                        required
                                        min={0}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Disponibilité</label>
                                    <select
                                        className={styles.input}
                                        value={availability ? 'true' : 'false'}
                                        onChange={e => setAvailability(e.target.value === 'true')}
                                    >
                                        <option value="true">Disponible</option>
                                        <option value="false">Loué</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Extracted Details */}
                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h3>📏 Détails des Surfaces (IA)</h3>
                            <p className="page-subtitle" style={{ fontSize: '0.85rem' }}>
                                Ces détails sont extraits automatiquement depuis le plan (optionnel). Vous pouvez les modifier.
                            </p>
                            <textarea
                                className={styles.textarea}
                                value={extractedDetails}
                                onChange={e => setExtractedDetails(e.target.value)}
                                placeholder="Détail des surfaces (murs, plafonds, pièces) après analyse..."
                                rows={6}
                            />
                        </div>

                        {/* Description + AI */}
                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <h3>✍️ Description</h3>
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    onClick={handleGenerateDescription}
                                    disabled={isGeneratingDesc}
                                >
                                    {isGeneratingDesc ? '✨ Génération en cours...' : '✨ Générer avec IA (Gemini)'}
                                </button>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Infos supplémentaires pour l'IA (optionnel)</label>
                                <input
                                    className={styles.input}
                                    value={extraInfo}
                                    onChange={e => setExtraInfo(e.target.value)}
                                    placeholder="ex. Vue panoramique, salle de réunion, close d'un métro, coworking..."
                                />
                            </div>

                            <textarea
                                className={styles.textarea}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="La description apparaîtra ici après la génération IA, ou saisissez-en une manuellement..."
                                rows={8}
                            />
                        </div>
                    </div>

                    {/* Right Column — Photos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1rem' }}>📸 Photos</h3>

                            <div
                                className={`${styles.uploadZone} ${imagePreviews.length > 0 ? styles.uploadZoneActive : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Cliquez pour remplaçer les photos</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Attention : les nouvelles photos écraseront les anciennes.</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </div>

                            {imagePreviews.length > 0 ? (
                                <div className={styles.imagePreviewGrid}>
                                    {imagePreviews.map((preview, idx) => (
                                        <div key={idx} className={styles.imagePreviewItem}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={preview.previewUrl} alt={`preview ${idx}`} className={styles.imagePreviewImg} />
                                            <button
                                                type="button"
                                                className={styles.removeImageBtn}
                                                onClick={() => removeImage(idx)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : initialImageUrls.length > 0 && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Photos Actuelles :</p>
                                    <div className={styles.imagePreviewGrid}>
                                        {initialImageUrls.map((url, idx) => (
                                            <div key={idx} className={styles.imagePreviewItem}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={url} alt={`actuelle ${idx}`} className={styles.imagePreviewImg} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Plan Section */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '1rem' }}>📐 Plan de Bureau</h3>

                            <div
                                className={`${styles.uploadZone} ${planPreview ? styles.uploadZoneActive : ''}`}
                                onClick={() => planInputRef.current?.click()}
                                style={{ padding: '1.5rem 1rem' }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Remplacer le plan</p>
                                <input
                                    ref={planInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handlePlanChange}
                                />
                            </div>

                            {planPreview ? (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={planPreview} alt="Plan Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f0f0f0' }} />
                                        <button
                                            type="button"
                                            className={styles.removeImageBtn}
                                            onClick={(e) => { e.stopPropagation(); removePlan(); }}
                                        >✕</button>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                        onClick={handleParsePlan}
                                        disabled={isParsingPlan}
                                    >
                                        {isParsingPlan ? '⏳ Analyse en cours...' : '✨ Extraire les infos avec IA'}
                                    </button>
                                </div>
                            ) : initialPlanUrl && (
                                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Plan Actuel :</p>
                                    <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={initialPlanUrl} alt="Plan Actuel" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f0f0f0' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Feedback message */}
                        {feedback && (
                            <div className={feedback.type === 'success' ? styles.successMsg : styles.errorMsg}>
                                {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                    <Link href="/admin/offices" className="btn-secondary">Annuler</Link>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}

