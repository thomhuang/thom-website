import type { BrewLogDraft, FieldErrors, UpdateDraft } from './coffeeEntryDraft';
import { Star } from './RatingStars';
import styles from './Coffee.module.css';

type CoffeeEntryNotesSectionProps = {
  draft: BrewLogDraft;
  fieldErrors: FieldErrors;
  updateDraft: UpdateDraft;
  changeRating: (rating: number) => void;
};

export default function CoffeeEntryNotesSection({
  draft,
  fieldErrors,
  updateDraft,
  changeRating,
}: CoffeeEntryNotesSectionProps) {
  return (
    <>
      <section className={styles.section} aria-labelledby="brew-flow">
        <h2 id="brew-flow">Bloom and pours</h2>

        <div className={styles.fieldGrid}>
          <label className={styles.field} htmlFor="bloom-time">
            Bloom time
            <input
              id="bloom-time"
              className={fieldErrors.bloomTime ? styles.invalid : undefined}
              type="text"
              value={draft.bloomTime}
              onChange={updateDraft('bloomTime')}
              placeholder="0:45"
              pattern="\d{1,2}:[0-5]\d"
              title="Enter a time like 0:45"
            />
            {fieldErrors.bloomTime && (
              <span className={styles.fieldError}>{fieldErrors.bloomTime}</span>
            )}
          </label>

          <label className={styles.field} htmlFor="bloom-water">
            Bloom water (g)
            <input
              id="bloom-water"
              className={fieldErrors.bloomWater ? styles.invalid : undefined}
              type="text"
              inputMode="numeric"
              pattern="\d+"
              value={draft.bloomWater}
              onChange={updateDraft('bloomWater')}
              placeholder="50"
            />
            {fieldErrors.bloomWater && (
              <span className={styles.fieldError}>{fieldErrors.bloomWater}</span>
            )}
          </label>
        </div>

        <label className={styles.field} htmlFor="pour-notes">
          Pour notes
          <textarea
            id="pour-notes"
            value={draft.pourNotes}
            onChange={updateDraft('pourNotes')}
            rows={4}
          />
        </label>
      </section>

      <section className={styles.section} aria-labelledby="tasting-notes">
        <h2 id="tasting-notes">Tasting notes</h2>

        <label className={styles.field} htmlFor="notes">
          <span className={styles.labelRow}>
            Notes
            <span className={styles.required}>Required</span>
          </span>
          <textarea
            id="notes"
            value={draft.notes}
            onChange={updateDraft('notes')}
            rows={6}
            required
          />
        </label>

        <div className={styles.ratingField}>
          <span>Rating</span>
          <div
            className={styles.ratingButtons}
            role="group"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span className={styles.ratingStar} key={star}>
                <Star fraction={draft.rating - (star - 1)} />
                <button
                  type="button"
                  className={[
                    styles.halfButton,
                    styles.halfButtonLeft,
                  ].join(' ')}
                  onClick={() => changeRating(star - 0.5)}
                  aria-label={`${star - 0.5} star rating`}
                  aria-pressed={draft.rating === star - 0.5}
                />
                <button
                  type="button"
                  className={[
                    styles.halfButton,
                    styles.halfButtonRight,
                  ].join(' ')}
                  onClick={() => changeRating(star)}
                  aria-label={`${star} star rating`}
                  aria-pressed={draft.rating === star}
                />
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
