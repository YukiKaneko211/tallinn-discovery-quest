import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import BottomSheet from '../components/BottomSheet';
import {
  IconBack,
  IconCamera,
  IconDeco,
  IconPin,
  IconSave,
  IconSparkle,
  IconText,
  IconTrash,
} from '../components/Icons';
import PhotoPreview from '../components/PhotoPreview';
import Popup from '../components/Popup';
import { usePhotoUrls } from '../components/usePhotoUrls';
import { getPhoto, insertPhoto, listPhotos, updatePhoto } from '../db/queries';
import type { Deco, Photo, Spot } from '../db/schema';
import EditPanel, { type EditTool } from '../editor/EditPanel';
import DecoPanel from '../editor/DecoPanel';
import EditorCanvas, { type EditorCanvasHandle } from '../editor/EditorCanvas';
import SpotPicker from '../editor/SpotPicker';
import TextPanel from '../editor/TextPanel';
import {
  DEFAULT_FILTERS,
  newId,
  type EditorState,
  type Filters,
  type ImageTransform,
  type TextItem,
} from '../editor/types';
import '../editor/editor.css';
import { CHECKIN_RADIUS_M } from '../lib/geo';
import { invalidatePhotoUrl, newPhotoKey, photoUrl, savePhoto } from '../lib/opfs';
import { useApp, useSpotsByDistance } from '../state/AppContext';

type Phase = 'capture' | 'preview' | 'editor';
type Tab = 'text' | 'deco' | 'edit' | null;

const TRASH = { w: 170, h: 84 };

export default function DecoSouvenir() {
  const navigate = useNavigate();
  const { photoId } = useParams();
  const [search] = useSearchParams();
  const { spots, notifyPhotosChanged, refreshPhotosToken } = useApp();
  const ranked = useSpotsByDistance();

  const [phase, setPhase] = useState<Phase>(photoId ? 'editor' : 'capture');
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [spotId, setSpotId] = useState<string | null>(search.get('spot'));
  const [createdAt, setCreatedAt] = useState<Date>(() => new Date());
  const [editingId, setEditingId] = useState<string | null>(photoId ?? null);
  const [state, setState] = useState<EditorState | null>(null);

  const [tab, setTab] = useState<Tab>(null);
  const [tool, setTool] = useState<EditTool | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmRetake, setConfirmRetake] = useState(false);
  const [saving, setSaving] = useState(false);

  const [gallery, setGallery] = useState<Photo[]>([]);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const galleryUrls = usePhotoUrls(gallery);

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EditorCanvasHandle>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* ------------------------------------------------------ stage measuring */
  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  /* -------------------------------------------------- gallery on capture */
  useEffect(() => {
    if (phase !== 'capture') return;
    listPhotos().then(setGallery);
  }, [phase, refreshPhotosToken]);

  /* ----------------------------------------------- pre-select closest spot */
  useEffect(() => {
    if (photoId || search.get('spot')) return;
    const closest = ranked[0];
    if (closest && closest.distance <= CHECKIN_RADIUS_M) setSpotId(closest.spot.id);
  }, [photoId, ranked, search]);

  /* --------------------------------------------------- load existing photo */
  useEffect(() => {
    if (!photoId) return;
    let cancelled = false;
    (async () => {
      const row = await getPhoto(photoId);
      if (!row || cancelled) return;
      const saved = row.editorStateJson as EditorState | null;
      const srcKey = saved?.sourcePath ?? row.imagePath;
      const url = await photoUrl(srcKey);
      if (!url || cancelled) return;
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        setImageEl(img);
        setSourceUrl(url);
        setSpotId(row.spotId);
        setCreatedAt(new Date(row.createdAt));
        setEditingId(row.id);
        if (saved) setState({ ...saved, sourcePath: srcKey });
      };
      img.src = url;
    })();
    return () => {
      cancelled = true;
    };
  }, [photoId]);

  /* ------------------------------------------- build state once we can fit */
  useEffect(() => {
    if (!imageEl || size.w === 0 || size.h === 0) return;
    setState((prev) => {
      if (prev && prev.stageWidth === size.w && prev.stageHeight === size.h) return prev;
      const cover = Math.max(size.w / imageEl.naturalWidth, size.h / imageEl.naturalHeight);
      if (!prev) {
        return {
          version: 1,
          sourcePath: '',
          stageWidth: size.w,
          stageHeight: size.h,
          image: {
            x: size.w / 2,
            y: size.h / 2,
            scale: cover,
            rotation: 0,
            flipH: false,
            flipV: false,
          },
          filters: { ...DEFAULT_FILTERS },
          items: [],
        };
      }
      // Stage resized (rotation / keyboard): rescale everything proportionally.
      const k = prev.stageWidth ? size.w / prev.stageWidth : 1;
      return {
        ...prev,
        stageWidth: size.w,
        stageHeight: size.h,
        image: { ...prev.image, x: prev.image.x * k, y: prev.image.y * k, scale: prev.image.scale * k },
        items: prev.items.map((it) => ({ ...it, x: it.x * k, y: it.y * k })),
      };
    });
  }, [imageEl, size]);

  /* ------------------------------------------------------------- capturing */
  const onFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setImageEl(img);
      setSourceUrl(url);
      setSourceBlob(file);
      setState(null);
      setEditingId(null);
      setCreatedAt(new Date());
      setPhase('preview');
    };
    img.src = url;
  };

  const retake = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(null);
    setImageEl(null);
    setSourceBlob(null);
    setState(null);
    setConfirmRetake(false);
    setPhase('capture');
    window.setTimeout(() => cameraInput.current?.click(), 60);
  };

  /* ------------------------------------------------------- editor helpers */
  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setState((s) => (s ? { ...s, filters: { ...s.filters, ...patch } } : s));
  }, []);

  const patchTransform = useCallback((patch: Partial<ImageTransform>) => {
    setState((s) => (s ? { ...s, image: { ...s.image, ...patch } } : s));
  }, []);

  const selectedText = useMemo(() => {
    const item = state?.items.find((i) => i.id === selectedId);
    return item && item.type === 'text' ? item : null;
  }, [state, selectedId]);

  const patchText = useCallback(
    (patch: Partial<TextItem>) => {
      if (!selectedText) return;
      setState((s) =>
        s
          ? {
              ...s,
              items: s.items.map((i) =>
                i.id === selectedText.id ? ({ ...i, ...patch } as TextItem) : i,
              ),
            }
          : s,
      );
    },
    [selectedText],
  );

  const addText = useCallback(() => {
    setState((s) => {
      if (!s) return s;
      const item: TextItem = {
        id: newId('t'),
        type: 'text',
        // PRD: a new text is centred on the preview. Vertically it sits a little
        // above centre so it stays visible while the Text panel covers the
        // lower two thirds of the screen.
        x: s.stageWidth / 2,
        y: Math.round(s.stageHeight * 0.32),
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        text: 'TALLINN!!',
        fontIndex: 0,
        fontSize: Math.round(s.stageWidth * 0.11),
        align: 'center',
        style: 'border',
        primary: '#ff8a1f',
        secondary: '#ffffff',
      };
      setSelectedId(item.id);
      return { ...s, items: [...s.items, item] };
    });
  }, []);

  const addDeco = useCallback((deco: Deco) => {
    setState((s) => {
      if (!s) return s;
      const w = Math.round(s.stageWidth * 0.34);
      const item = {
        id: newId('d'),
        type: 'deco' as const,
        decoId: deco.id,
        src: deco.imageUrl,
        x: s.stageWidth / 2,
        y: s.stageHeight / 2,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        width: w,
        height: Math.round(w * (200 / 220)),
      };
      setSelectedId(item.id);
      return { ...s, items: [...s.items, item] };
    });
    // PRD: picking an unlocked Deco returns to Overview Mode with it centred.
    setTab(null);
  }, []);

  const openTab = (next: Tab) => {
    setTab(next);
    setTool(null);
    if (next === 'text' && !selectedText) addText();
  };

  /* --------------------------------------------------------- pinch on photo */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; angle: number; scale: number; rotation: number } | null>(
    null,
  );
  const transformImage = tab === 'edit' && tool === 'crop';

  const onPointerDown = (e: React.PointerEvent) => {
    if (!transformImage) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!transformImage || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    if (pts.length < 2 || !state) {
      gesture.current = null;
      return;
    }
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    const dist = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (!gesture.current) {
      gesture.current = { dist, angle, scale: state.image.scale, rotation: state.image.rotation };
      return;
    }
    const g = gesture.current;
    patchTransform({
      scale: Math.min(6, Math.max(0.1, (g.scale * dist) / (g.dist || 1))),
      rotation: g.rotation + (angle - g.angle),
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };

  /* --------------------------------------------------------------- saving */
  const handleItemDrag = (isDragging: boolean, dropped?: { id: string; x: number; y: number }) => {
    setDragging(isDragging);
    if (isDragging || !dropped || !state) return;
    const inTrash =
      dropped.y > size.h - TRASH.h - 10 &&
      Math.abs(dropped.x - size.w / 2) < TRASH.w / 2;
    if (inTrash) {
      setState((s) => (s ? { ...s, items: s.items.filter((i) => i.id !== dropped.id) } : s));
      setSelectedId(null);
    }
  };

  const save = async () => {
    if (!state || saving) return;
    setSaving(true);
    try {
      setSelectedId(null);
      // let the transformer disappear before the export
      await new Promise((r) => window.setTimeout(r, 40));
      const blob = await canvasRef.current!.toBlob();
      const id = editingId ?? newId('p');

      let sourcePath = state.sourcePath;
      if (!sourcePath) {
        sourcePath = newPhotoKey(`${id}-source`);
        if (sourceBlob) await savePhoto(sourcePath, sourceBlob);
      }
      const imagePath = newPhotoKey(id);
      await savePhoto(imagePath, blob);
      invalidatePhotoUrl(imagePath);

      const persisted: EditorState = { ...state, sourcePath };
      if (editingId) {
        await updatePhoto(id, { spotId, imagePath, editorStateJson: persisted });
      } else {
        await insertPhoto({ id, spotId, imagePath, editorStateJson: persisted, createdAt });
      }
      notifyPhotosChanged();
      navigate(spotId ? `/spot/${spotId}?tab=photos` : '/deco', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const currentSpot: Spot | null = spots.find((s) => s.id === spotId) ?? null;

  /* ---------------------------------------------------------------- render */

  if (phase === 'capture') {
    return (
      <div className="page cap">
        <input
          ref={cameraInput}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          ref={libraryInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="cap__empty">
          <IconCamera size={56} />
          <div>
            <p style={{ fontWeight: 800, fontSize: 'var(--fs-lg)', margin: '0 0 4px' }}>
              Deco Souvenir
            </p>
            <p style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>
              Take a photo at a Spot and decorate it with texts and Decos.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 10, width: '100%', maxWidth: 300 }}>
            <button
              type="button"
              className="btn btn--accent btn--block"
              onClick={() => cameraInput.current?.click()}
            >
              <IconCamera size={20} /> Take a photo
            </button>
            <button
              type="button"
              className="btn btn--weak btn--block"
              onClick={() => libraryInput.current?.click()}
            >
              Choose from library
            </button>
          </div>

          {gallery.length > 0 ? (
            <div style={{ width: '100%' }}>
              <p className="list__label">Your Deco photos</p>
              <ul className="photogrid">
                {gallery.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="photogrid__cell"
                      onClick={() => setGalleryIndex(i)}
                    >
                      {galleryUrls[p.id] ? <img src={galleryUrls[p.id]} alt="" /> : <span />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {galleryIndex !== null ? (
          <PhotoPreview
            photos={gallery}
            urls={galleryUrls}
            startIndex={galleryIndex}
            title="Your Deco photos"
            onClose={() => setGalleryIndex(null)}
          />
        ) : null}
      </div>
    );
  }

  if (phase === 'preview') {
    return (
      <div className="page cap">
        <div className="cap__stage">
          {sourceUrl ? <img src={sourceUrl} alt="Captured" /> : null}
          <div className="cap__selector">
            <button type="button" className="cap__selbtn" onClick={() => setShowPicker(true)}>
              <IconPin size={18} />
              {currentSpot ? currentSpot.name : 'Select a Spot'}
            </button>
          </div>
        </div>
        <div className="cap__foot">
          <button type="button" className="btn btn--danger" onClick={() => setConfirmRetake(true)}>
            <IconCamera size={20} /> Retake
          </button>
          <button
            type="button"
            className="btn btn--accent"
            onClick={() => {
              // Spot + date/time are held in memory only until Save (per PRD).
              setCreatedAt(new Date());
              setPhase('editor');
              setTab(null);
            }}
          >
            <IconSparkle size={20} /> Start Editing
          </button>
        </div>

        {showPicker ? (
          <SpotPicker
            spots={spots}
            onClose={() => setShowPicker(false)}
            onSelect={(s) => {
              setSpotId(s?.id ?? null);
              setShowPicker(false);
            }}
          />
        ) : null}

        {confirmRetake ? (
          <Popup
            onBackdrop={() => setConfirmRetake(false)}
            title="Are you sure retaking the photo?"
            description="Retaking a photo will remove the current photo."
            actions={
              <>
                <button type="button" className="btn btn--danger" onClick={retake}>
                  Retake
                </button>
                <button
                  type="button"
                  className="btn btn--inactive"
                  onClick={() => setConfirmRetake(false)}
                >
                  Cancel
                </button>
              </>
            }
          />
        ) : null}
      </div>
    );
  }

  /* --------------------------------------------------------------- editor */
  const overview = tab === null;

  return (
    <div className="page ed">
      <div
        className="ed__stage"
        ref={stageWrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {state && size.w > 0 ? (
          <EditorCanvas
            ref={canvasRef}
            image={imageEl}
            state={state}
            onChange={setState}
            width={size.w}
            height={size.h}
            selectedId={selectedId}
            onSelect={setSelectedId}
            hideItems={tab === 'edit'}
            transformImage={transformImage}
            onItemDragChange={handleItemDrag}
            onTextActivate={(id) => {
              setSelectedId(id);
              setTab('text');
            }}
          />
        ) : (
          <div className="loading">
            <span className="spinner" />
          </div>
        )}

        <button
          type="button"
          className="phead__back"
          style={{ position: 'absolute', left: 6, top: 6, zIndex: 30, color: '#fff', background: 'rgba(0,0,0,.4)' }}
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <IconBack />
        </button>

        {tab === 'text' && selectedText ? (
          <div className="ed__float">
            <span className="ed__label">Size</span>
            <input
              className="ed__slider"
              type="range"
              min={12}
              max={Math.max(40, Math.round(size.w * 0.4))}
              value={selectedText.fontSize}
              aria-label="Font size"
              onChange={(e) => patchText({ fontSize: Number(e.target.value) })}
            />
          </div>
        ) : null}

        {tab === 'edit' ? <span className="ed__hint">Texts &amp; Decos are hidden while editing the photo</span> : null}

        {overview && dragging ? (
          <div className="ed__trash" style={{ width: TRASH.w, height: TRASH.h }}>
            <IconTrash size={30} />
            <span>Drag to Delete</span>
          </div>
        ) : null}

        {overview && !dragging ? (
          <button
            type="button"
            className="btn btn--accent ed__save"
            onClick={save}
            disabled={saving}
          >
            <IconSave size={20} /> {saving ? 'Saving…' : 'Save'}
          </button>
        ) : null}
      </div>

      <BottomSheet
        open={tab !== null}
        onOpenChange={(open) => {
          if (!open) setTab(null);
          else if (tab === null) openTab('text');
        }}
        maxRatio={2 / 3}
        peek={
          <div className="ed__tabs">
            {(
              [
                { id: 'text' as const, label: 'Text', Icon: IconText },
                { id: 'deco' as const, label: 'Deco', Icon: IconDeco },
                { id: 'edit' as const, label: 'Edit', Icon: IconSparkle },
              ]
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={`ed__tab${tab === id ? ' ed__tab--on' : ''}`}
                onClick={() => (tab === id ? setTab(null) : openTab(id))}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        }
      >
        {tab === 'text' ? (
          <TextPanel item={selectedText} onPatch={patchText} onFinish={() => setTab(null)} />
        ) : null}
        {tab === 'deco' ? <DecoPanel spotId={spotId} onPick={addDeco} /> : null}
        {tab === 'edit' && state ? (
          <EditPanel
            filters={state.filters}
            transform={state.image}
            onFilters={patchFilters}
            onTransform={patchTransform}
            tool={tool}
            onTool={setTool}
          />
        ) : null}
      </BottomSheet>
    </div>
  );
}
